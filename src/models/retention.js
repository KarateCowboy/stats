/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const common = require('../api/common')
const moment = require('moment')
const AndroidUsageAggregateWOI = require('./android_usage_aggregate_week')
const UsageAggregateWOI = require('./usage_aggregate_woi').UsageAggregateUtil
const ProgressBar = require('smooth-progress')
const _ = require('underscore')

const WEEKLY_RETENTION_QUERY = `
SELECT
  woi,
  week_delta,
  sum(current) as current,
  sum(starting) as starting,
  sum(current) / sum(starting) as retained_percentage
FROM dw.fc_retention_week_mv FC
WHERE
  FC.platform = ANY ($1) AND
  FC.channel  = ANY ($2) AND
  fc.woi::date > $3::date
GROUP BY
  woi,
  week_delta
ORDER BY
  woi,
  week_delta
`

class RetentionMonth {
  static async refresh () {
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_month_mv')
  }
}

class RetentionWeek {
  static async refresh () {
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_week_mv')
  }

  static async aggregated (platform, channel, ref) {
    let rows
    const query = knex('dw.fc_retention_week_mv').select(['woi',
      'week_delta']).sum({'current': 'current'}).sum({'starting': 'starting'}).select(knex.raw('sum(current)/sum(starting) as retained_percentage'))
      .whereIn('platform', platform)
      .whereIn('channel', channel)
      .andWhere('woi','>',moment().subtract(12,'weeks').startOf('week').format('YYYY-MM-DD'))
      .andWhere('woi','<',moment().startOf('week').format('YYYY-MM-DD'))
      .andWhere('week_delta','<',12)
      .andWhere('week_delta','>=',0)
      .groupBy('woi', 'week_delta')

    if (!!ref) {
      query.whereIn('ref', ref.split(','))
    }
    query.orderBy('woi')
    query.orderBy('week_delta')
    const result = await pg_client.query(query.toString())
    rows = result.rows.filter(row => {
      const week_monday = moment(row.woi).startOf('week').add(1, 'days')
      const current_monday = moment().startOf('week')
      const weeks_ago = current_monday.diff(week_monday,'weeks')
      return (moment(row.woi).diff(week_monday, 'days') === 0) && row.week_delta <= weeks_ago
    })

    for (let row of rows) {
      common.convertPlatformLabels(row)
      row.current = parseInt(row.current)
      row.starting = parseInt(row.starting)
      row.retained_percentage = parseFloat(row.retained_percentage)
      row.month_delta = parseInt(row.month_delta)
      row.week_delta = parseInt(row.week_delta)
      if (row.week_delta === 0) {
        row.retained_percentage = 1.0
      }
    }
    return rows
  }
}

const aggregate_id = (usage, collection_name) => {

  platform = collection_name === 'android_usage' ? 'androidbrowser' : usage.platform
  return {
    ymd: usage.year_month_day,
    platform: platform,
    version: usage.version,
    channel: usage.channel,
    woi: usage.woi,
    ref: usage.ref || 'none',
    first_time: usage.first
  }
}

class WeekOfInstall {
  static async transfer_platform_aggregate (collection_name, start_date, force) {
    const aggregate_collection = `${collection_name}_aggregate_woi`
    let nearest_week = moment().startOf('week').add(1, 'days').format('YYYY-MM-DD')
    const usage_params = {
      daily: true,
      woi: {$gte: start_date, $lt: nearest_week},
      year_month_day: {$gte: start_date, $lt: nearest_week},
      aggregated_at: {
        $exists: false
      }
    }
    if (force) {
      delete usage_params.aggregated_at
    }
    let usages = await mongo_client.collection(collection_name).find(usage_params)

    let count = await usages.count()
    let batch = []
    let sum = 0
    await usages.maxTimeMS(360000000)
    const bar = ProgressBar({
      tmpl: `Loading ... :bar :percent :eta`,
      width: 100,
      total: count
    })
    while (await usages.hasNext()) {
      bar.tick(1)
      let usage = await usages.next()
      let has_next = await usages.hasNext()
      batch.push(usage)
      if (batch.length > 10000 || has_next === false) {
        await Promise.all(batch.map(async (usage) => {
          const usage_aggregate_id = aggregate_id(usage, collection_name)
          try {
            await mongo_client.collection(aggregate_collection).update(
              {
                _id: usage_aggregate_id
              }, {
                $addToSet: {usages: usage._id}
              }, {
                upsert: true
              }
            )
            await mongo_client.collection(collection_name).update({_id: usage._id}, {
              $set: {
                aggregated_at: Date.now()
              }
            })
          } catch (e) {
            console.log(e.message)
          }
        }))
        sum += 10000
        batch = []
      }
    }
  }

  static from_usage_aggregate_woi (entry) {
    const cleaned_entry = UsageAggregateWOI.scrub(entry)
    let actual_record = Object.assign({}, cleaned_entry._id)
    actual_record.total = cleaned_entry.usages.length
    return actual_record
  }
}

module.exports.RetentionMonth = RetentionMonth
module.exports.RetentionWeek = RetentionWeek
module.exports.WeekOfInstall = WeekOfInstall
