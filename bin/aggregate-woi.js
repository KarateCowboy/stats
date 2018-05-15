#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path')
const commander = require('commander')
const ProgressBar = require('smooth-progress')
const moment = require('moment')
const pg = require('pg')
const mongoc = require('../src/mongoc')
const Knex = require('knex')
const reporter = require('../src/reporter')
const WeekOfInstall = require('../src/models/retention').WeekOfInstall
const RetentionWeek = require('../src/models/retention').RetentionWeek
const RetentionMonth = require('../src/models/retention').RetentionMonth
const UsageAggregateWOI = require('../src/models/usage_aggregate_woi').UsageAggregateWOI
commander.option('-d --days [num]', 'Days to go back in reporting', 90)
  .option('-s, --skip-aggregation')
  .option('-a, --android')
  .option('-i, --ios')
  .option('-g, --general').parse(process.argv)

const possible_collections = {
  android: 'android_usage',
  ios: 'ios_usage',
  usage: 'usage'
}
let collections = []

let jobName = path.basename(__filename)
let runInfo = reporter.startup(jobName)
let cutoff

const run = async () => {
  if (commander.android) {
    collections.push(possible_collections.android)
  } else if (commander.ios) {
    collections.push(possible_collections.ios)
  } else if (commander.general) {
    collections.push(possible_collections.usage)
  } else {
    collections = Object.values(possible_collections)
  }
  cutoff = moment().subtract(Number(commander.days), 'days').startOf('week').format('YYYY-MM-DD')
  try {
    global.pg_client = await pg.connect(process.env.DATABASE_URL)
    global.knex = await Knex({client: 'pg', connection: process.env.DATABASE_URL})

    if (!commander.skipAggregation) {
      for (let platform of collections) {
        global.mongo_client = await mongoc.setupConnection()
        console.log(`Generating aggregates for ${platform} installed week of ${cutoff}`)
        await WeekOfInstall.transfer_platform_aggregate(platform, cutoff)
        global.mongo_client.close()
      }
    }

    for (let collection of collections) {
      global.mongo_client = await mongoc.setupConnection()
      const agg_collection = `${collection}_aggregate_woi`
      console.log(`fetching from ${agg_collection} installed week of ${cutoff} and later`)
      const results = await mongo_client.collection(agg_collection).find({}).toArray()
      await processResults(results)
      global.mongo_client.close()
    }
    console.log(`Refreshing retention month view`)
    await RetentionMonth.refresh()
    console.log(`Refreshing retention week view`)
    await RetentionWeek.refresh()
    console.log('Finalizing...')
    await reporter.complete(runInfo, pg_client)
    pg_client.end()
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
  process.exit(0)
}

const processResults = async (results) => {
  const total_entries = results.length
  console.log(`total is ${total_entries}`)
  const bar = ProgressBar({
    tmpl: `Loading ... :bar :percent :eta`,
    width: 25,
    total: total_entries
  })
  const QUERY = `
INSERT INTO dw.fc_retention_woi (ymd, platform, version, channel, woi, ref, total)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (ymd, platform, version, channel, woi, ref) DO UPDATE SET total = EXCLUDED.total`
  let rejected = []
  let summed_totals = 0
  let platforms = [...new Set(results.map(r => r._id.platform))]
  for (let platform of platforms) {
    try {
      await knex('dw.fc_retention_woi').where('platform', platform).andWhere('woi', '>', cutoff).delete()
    } catch (e) {
      console.log(e.message)
    }
  }

  for (let i = 0; i < results.length; i++) {
    bar.tick(1)
    const current = results[i]
    let row
    try {
      const scrubbed_row = UsageAggregateWOI.scrub(current)
      row = WeekOfInstall.from_usage_aggregate_woi(scrubbed_row)
      if (UsageAggregateWOI.is_valid(scrubbed_row)) {
        // await pg_client.query(QUERY, [row.ymd, row.platform, row.version, row.channel, row.woi, row.ref, row.total])
        await UsageAggregateWOI.transfer_to_retention_woi(scrubbed_row)
        summed_totals += row.total
      } else {
        rejected.push(scrubbed_row)
      }
    } catch (e) {
    }
  }
  console.log(`summed_totals ${summed_totals}`)
}

run()
