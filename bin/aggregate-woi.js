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
const UsageAggregateWOI = require('../src/models/usage_aggregate_woi').UsageAggregateUtil
const Util = require('../src/models/util').Util
const _ = require('underscore')
commander.option('-d --days [num]', 'Days to go back in reporting', 90)
  .option('-e, --end [num]', 'days to cutoff', 0)
  .option('-s, --skip-aggregation')
  .option('-a, --android')
  .option('-c, --core')
  .option('-i, --ios')
  .option('-f, --force')
  .option('-g, --general').parse(process.argv)

const possible_collections = {
  android: 'android_usage',
  ios: 'ios_usage',
  usage: 'usage',
  core: 'brave_core_usage'
}
const platforms = {
  android: ['androidbrowser'],
  usage: ['linux',
    'winia32',
    'unknown',
    'osx',
    'winx64'],
  ios: ['ios'],
  core: ['win64-bc', 'linux-bc', 'winia32-bc', 'osx-bc']
}
let relevant_platforms = []
let collections = []

let jobName = path.basename(__filename)
let runInfo = reporter.startup(jobName)
let start_date, end_date

const run = async () => {
  if (commander.android) {
    collections.push(possible_collections.android)
    relevant_platforms.push(platforms.android)
  } else if (commander.ios) {
    collections.push(possible_collections.ios)
    relevant_platforms.push(platforms.ios)
  } else if (commander.general) {
    collections.push(possible_collections.usage)
    relevant_platforms.push(platforms.usage)
  } else if (commander.core) {
    collections.push(possible_collections.core)
    relevant_platforms.push(platforms.core)
  } else {
    collections = Object.values(possible_collections)
    relevant_platforms.push(platforms.core)
    relevant_platforms.push(platforms.usage)
    relevant_platforms.push(platforms.ios)
    relevant_platforms.push(platforms.android)
  }
  relevant_platforms = _.flatten(relevant_platforms)
  start_date = moment().subtract(Number(commander.days), 'days').format('YYYY-MM-DD')
  end_date = moment().subtract(Number(commander.end), 'days').format('YYYY-MM-DD')
  try {
    global.pg_client = await pg.connect(process.env.DATABASE_URL)
    global.knex = await Knex({client: 'pg', connection: process.env.DATABASE_URL})

    if (!commander.skipAggregation) {
      for (let platform of collections) {
        global.mongo_client = await mongoc.setupConnection()
        if (platform === 'ios_usage') {
          console.log(`Scrubbing ${platform}`)
          await scrub_usage_dates(start_date, platform)
        }
        console.log(`Generating aggregates for ${platform} from ${start_date} until ${end_date}`)
        await aggregate_for_range(platform, start_date, end_date, commander.force)
        // await WeekOfInstall.transfer_platform_aggregate(platform, start_date, end_date, commander.force)
        global.mongo_client.close()
      }
    }

    for (let collection of collections) {
      global.mongo_client = await mongoc.setupConnection()
      const agg_collection = `${collection}_aggregate_woi`
      console.log(`fetching from ${agg_collection} starting ${start_date} and ending ${end_date}`)
      await processResults(agg_collection, start_date, end_date)
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
    console.log(e.message)
    process.exit(1)
  }
  process.exit(0)
}
aggregate_for_range = async (collection_name, start_date, end_date, force = false) => {

  const start_day = moment(start_date)
  let end_day = moment(end_date)
  console.log(`Aggregating from ${start_day.format('YYYY-MM-DD')} with cutoff ${end_day.format('YYYY-MM-DD')}`)
  const usage_params = {
    daily: true,
    year_month_day: {$gte: start_day.format('YYYY-MM-DD'), $lt: end_day.format('YYYY-MM-DD')},
    version: {$not: /\([A-Za-z0-9]+\)$/},
    aggregated_at: {$exists: false}
  }
  if (force) {
    delete usage_params.aggregated_at
  }
  let count
  try {
    count = await mongo_client.collection(collection_name).count(usage_params, {timeout: false})
  } catch (e) {
    console.log('Problem counting usages')
    console.log(e.message)
    process.exit()
  }
  let bar
  if(!process.env.TEST){
    bar = ProgressBar({
      tmpl: `Aggregating ${count} ... :bar :percent :eta`,
      width: 100,
      total: count
    })
  }
  await mongo_client.close()
  let current_day = start_day.clone()
  const {fork} = require('child_process')
  let dates = []
  while (current_day.isBefore(end_day)) {
    dates.push(current_day.format('YYYY-MM-DD'))
    current_day.add(1, 'days')
  }
  await Promise.all(dates.map(async (date) => {
    return new Promise((resolve, reject) => {
      const find = fork('./bin/aggregate_for_day.js')
      find.send({date: date, collection_name: collection_name, force: force})
      find.on('message', msg => {
        if (msg === 'success') {
          resolve()
        } else if (msg === 'tick' && !process.env.TEST) {
          bar.tick(1)
        } else if (msg === 'error') {
          reject()
        }
      })
    })
  }))
}

const processResults = async (agg_collection, start_date, end_date) => {
  const results = await mongo_client.collection(agg_collection).find({'_id.ymd': {$gte: start_date, $lte: end_date}})
  results.maxTimeMS(3600000)
  const total_entries = await results.count()
  console.log(`total is ${total_entries}`)
  const bar = ProgressBar({
    tmpl: `Loading ... :bar :percent :eta`,
    width: 25,
    total: total_entries
  })
  let summed_totals = 0
  for (let platform of relevant_platforms) {
    try {
      await knex('dw.fc_retention_woi').where('platform', platform).andWhere(knex.raw(`ymd >= '${start_date}'::date AND ymd <= '${end_date}'::date `)).delete()
    } catch (e) {
      console.log('Error cleansing')
      console.log(e.message)
    }
  }

  while (await results.hasNext()) {
    bar.tick(1)
    const current = await results.next()
    try {
      if (UsageAggregateWOI.is_valid(current)) {
        await UsageAggregateWOI.transfer_to_retention_woi(current)
        summed_totals += current.usages.length
      }
    } catch (e) {
      console.log('Error transfering')
    }
  }
  console.log(`summed_totals ${summed_totals}`)
}

scrub_usage_dates = async (cutoff, collection) => {
  const cutoff_as_ts = new Date(cutoff).getTime()
  let records = await mongo_client.collection(collection).find({
    ts: {$gte: cutoff_as_ts},
    $or: [{
      woi: {
        $nin: [/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/], $exists: true, $in: [/^20[\d]{2,2}/]
      }
    },
      {
        year_month_day: {
          $nin: [/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/], $exists: true, $in: [/^20[\d]{2,2}/]
        }
      }
    ]
  }).toArray()
  console.log(`${records.length} records`)
  const bar = ProgressBar({
    tmpl: `Loading ... :bar :percent :eta`,
    width: 25,
    total: records.length
  })
  while (records.length > 0) {
    const batch = records.length > 50000 ? records.splice(0, 50000) : records.splice(0, records.length)
    await Promise.all(batch.map(async (original_usage) => {
      bar.tick(1)
      const usage_clone = Object.assign({}, original_usage)
      let adjusted = false
      if (Util.is_valid_date_string(usage_clone.woi) === false) {
        adjusted = true
        usage_clone.woi = Util.fix_date_string(usage_clone.woi)
      }
      if (Util.is_valid_date_string(usage_clone.year_month_day)) {
        adjusted = true
        usage_clone.year_month_day = Util.fix_date_string(usage_clone.year_month_day)
      }

      if (adjusted) {
        try {
          await mongo_client.collection(collection).update({_id: original_usage._id}, {
            $set: {
              woi: usage_clone.woi,
              year_month_day: usage_clone.year_month_day
            }
          })
          await mongo_client.collection(`${collection}_fixed_backup`).insert(original_usage)
        } catch (e) {
          if (!e.message.includes('duplicate') && !e.message.includes('not inserting for some')) {
            console.log(e.message)
          }
        }
      }
      return 0
    }))
  }
}

run()
