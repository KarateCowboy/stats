/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var _ = require('underscore')
var assert = require('assert')

var dataset = require('./dataset')
var common = require('./common')
const RetentionWeek = require('../models/retention').RetentionWeek
const moment = require('moment')

const DELTA = `
SELECT
  USG.ymd,
  USG.count,
  USG.prev,
  USG.delta,
  USG.delta / USG.count AS change,
  FST.first_count,
  USG.delta / FST.first_count AS retention
FROM
(SELECT
   TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd,
   SUM(total) AS count,
   COALESCE(LAG(SUM(total), 1) OVER (ORDER BY ymd), SUM(total)) AS prev,
   SUM(total) - COALESCE(LAG(SUM(total), 1) OVER (ORDER BY ymd), SUM(total)) AS delta
 FROM dw.fc_usage
 WHERE
   ymd >= current_date - CAST($1 as INTERVAL) AND
   platform = ANY ($2) AND
   channel = ANY ($3)
 GROUP BY ymd ) USG JOIN
(SELECT
   TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
   SUM(FC.total) AS first_count
 FROM dw.fc_usage FC
 WHERE
   FC.ymd >= current_date - CAST($1 as INTERVAL) AND
   first_time AND
   FC.platform = ANY ($2) AND
   FC.channel = ANY ($3)
 GROUP BY FC.ymd ) FST ON USG.ymd = FST.ymd
ORDER BY USG.ymd DESC
`

const AVERAGE_MONTHLY_DAU = `
SELECT ymd, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = COALESCE($3, ref)
GROUP BY ymd
ORDER BY ymd DESC
`

const AVERAGE_MONTHLY_DAU_PLATFORM = `
SELECT ymd, platform, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = COALESCE($3, ref)
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

const AVERAGE_MONTHLY_FIRST_DAU = `
SELECT ymd, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = COALESCE($3, ref)
GROUP BY ymd
ORDER BY ymd DESC
`

const AVERAGE_MONTHLY_FIRST_DAU_PLATFORM = `
SELECT ymd, platform, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = COALESCE($3, ref)
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

const DAU = `
SELECT TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd, SUM(total) AS count
FROM dw.fc_usage
WHERE
  ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  platform = ANY ($2) AND
  channel = ANY ($3) AND
  ref = COALESCE($4, ref)
GROUP BY ymd
ORDER BY ymd DESC
`

const MAU_PLATFORM = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  platform,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = COALESCE($3, ref) AND
  ymd > '2016-01-31'
GROUP BY
  left(ymd::text, 7),
  platform
ORDER BY
  left(ymd::text, 7),
 platform
`

const MAU = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = COALESCE($3, ref) AND
  ymd > '2016-01-31'
GROUP BY
  left(ymd::text, 7)
ORDER BY
  left(ymd::text, 7)
`

const RETENTION = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  TO_CHAR(FC.woi, 'YYYY-MM-DD') AS woi,
  SUM(FC.total) AS count
FROM dw.fc_retention_woi FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3)
GROUP BY FC.ymd, FC.woi
ORDER BY FC.ymd DESC, FC.woi
`

const RETENTION_MONTH = `
SELECT
  moi,
  month_delta,
  sum(current) as current,
  sum(starting) as starting,
  sum(current) / sum(starting) as retained_percentage
FROM dw.fc_retention_month_mv FC
WHERE
  FC.platform = ANY ($1) AND
  FC.channel  = ANY ($2) AND
  FC.ref      = ANY ($3) AND
  FC.moi      = ANY ($4)
GROUP BY
  moi,
  month_delta
ORDER BY
  moi,
  month_delta
`

const DAU_PLATFORM = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS count,
  ROUND(SUM(FC.total) / ( SELECT SUM(total) FROM dw.fc_usage WHERE ymd = FC.ymd AND platform = ANY ($2) AND channel = ANY ($3)), 3) * 100 AS daily_percentage
FROM dw.fc_usage_platform_mv FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref)
GROUP BY FC.ymd, FC.platform
ORDER BY FC.ymd DESC, FC.platform
`

const DAU_PLATFORM_MINUS_FIRST = `
SELECT
  USAGE.ymd,
  USAGE.platform,
  USAGE.count AS all_count,
  FIR.first_count,
  USAGE.count - FIR.first_count AS count
FROM
(
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS count
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref)
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) USAGE JOIN (
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS first_count
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref) AND
  FC.first_time
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) FIR ON USAGE.ymd = FIR.ymd AND USAGE.platform = FIR.platform
ORDER BY USAGE.ymd DESC, USAGE.platform
`

const DAU_PLATFORM_FIRST = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS count,
ROUND(SUM(FC.total) / ( SELECT SUM(total) FROM dw.fc_usage WHERE ymd = FC.ymd AND first_time AND platform = ANY ($2) AND channel = ANY ($3)), 3) * 100 AS daily_percentage
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  first_time AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref)
GROUP BY FC.ymd, FC.platform
ORDER BY FC.ymd DESC, FC.platform
`

const DAU_PLATFORM_FIRST_SUMMARY = `SELECT * FROM dw.fc_platform_downloads_summary_mv ORDER BY mobile, vendor`

const PLATFORM_SUMMARY_GEO = `
SELECT 'ios' AS platform, FC.country_code, DM.name, '000' AS dma, FC.downloads
FROM appannie.fc_inception_by_country FC JOIN appannie.dm_countries DM ON FC.country_code = DM.code
`

const DAU_VERSION = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.version,
  SUM(FC.total) AS count,
  ROUND(SUM(FC.total) / ( SELECT SUM(total) FROM dw.fc_usage WHERE ymd = FC.ymd AND platform = ANY ($2) AND channel = ANY ($3) ), 3) * 100 AS daily_percentage
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref)
GROUP BY FC.ymd, FC.version
ORDER BY FC.ymd DESC, FC.version
`

// Data endpoints
exports.setup = (server, client, mongo) => {
  assert(mongo, 'mongo configured')

  function retrieveCommonParameters (request) {
    let days = parseInt(request.query.days || 7, 10) + ' days'
    let platforms = common.platformPostgresArray(request.query.platformFilter)
    let channels = common.channelPostgresArray(request.query.channelFilter)
    let ref = request.query.ref || null
    return [days, platforms, channels, ref]
  }

  // Version for today's daily active users
  server.route({
    method: 'GET',
    path: '/api/1/versions',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(DAU_VERSION, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      // condense small version counts to an 'other' category
      results.rows = dataset.condense(results.rows, 'ymd', 'version')
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(DAU, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Monthly average daily stats by platform
  server.route({
    method: 'GET',
    path: '/api/1/monthly_average_stats_platform',
    handler: function (request, reply) {
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let channels = common.channelPostgresArray(request.query.channelFilter)
      const query = knex('dw.fc_average_monthly_usage_mv').select('ymd', 'platform')
        .sum({dau: 'average_dau'})
        .sum({mau: 'mau'})
        .sum({first_time: 'average_first_time'})
        .whereIn('platform', platforms)
        .whereIn('channel', channels)
        .groupBy('ymd', 'platform')
        .orderBy('platform')
        .orderBy('ymd')
      const query_string = query.toString()
      client.query(query_string, (err, results) => {
        if (err) {
          reply(err.toString())
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
          results.rows.forEach((row) => common.convertPlatformLabels(row))
          results.rows.forEach((row) => {
            row.dau = parseInt(row.dau)
            row.mau = parseInt(row.mau)
            row.first_time = parseInt(row.first_time)
          })
          reply(results.rows)
        }
      })
    }
  })

  // Monthly average daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_monthly_average',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(AVERAGE_MONTHLY_DAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Monthly average daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_monthly_average_platform',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(AVERAGE_MONTHLY_DAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Monthly average daily first time users
  server.route({
    method: 'GET',
    path: '/api/1/dau_first_monthly_average',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(AVERAGE_MONTHLY_FIRST_DAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Monthly average daily first time users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_first_monthly_average_platform',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(AVERAGE_MONTHLY_FIRST_DAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  //missing retention days
  server.route({
    method: 'GET',
    path: '/api/1/retention/missing',
    handler: async function (request, reply) {
      const RetentionService = require('../services/retention.service')
      const service = new RetentionService()
      const results = await service.missing()
      reply(results)
    }
  })

  // Retention
  server.route({
    method: 'GET',
    path: '/api/1/retention',
    handler: function (request, reply) {
      let days = parseInt(request.query.days || 7, 10) + ' days'
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let channels = common.channelPostgresArray(request.query.channelFilter)
      client.query(RETENTION, [days, platforms, channels], (err, results) => {
        if (err) {
          reply(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
          results.rows.forEach((row) => common.convertPlatformLabels(row))
          reply(results.rows)
        }
      })
    }
  })

  // Retention
  server.route({
    method: 'GET',
    path: '/api/1/retention_month',
    handler: async function (request, reply) {
      try {
        let platforms = common.platformPostgresArray(request.query.platformFilter)
        let channels = common.channelPostgresArray(request.query.channelFilter)
        let refs = ['none']

        const last_three_months = [
          moment().startOf('month').format('YYYY-MM-DD'),
          moment().startOf('month').subtract(1, 'months').format('YYYY-MM-DD'),
          moment().startOf('month').subtract(2, 'months').format('YYYY-MM-DD'),
          moment().startOf('month').subtract(3, 'months').format('YYYY-MM-DD'),
        ]
        let rows = (await client.query(RETENTION_MONTH, [platforms, channels, refs, last_three_months])).rows
        rows.forEach((row) => common.convertPlatformLabels(row))
        rows = rows.map((row) => {
          row.current = parseInt(row.current)
          row.starting = parseInt(row.starting)
          row.retained_percentage = parseFloat(row.retained_percentage)
          row.month_delta = parseInt(row.month_delta)
          if (row.month_delta === 0) {
            row.retained_percentage = 1.0
          }
          return row
        })
        reply(rows)
      } catch (e) {
        console.log(`There was an error
        ${e.message}`)
        reply(e.toString()).code(500)
      }
    }
  })
  // Retention
  server.route({
    method: 'GET',
    path: '/api/1/retention_week',
    handler: async function (request, reply) {
      try {
        let platforms = common.platformPostgresArray(request.query.platformFilter)
        let channels = common.channelPostgresArray(request.query.channelFilter)
        let ref = request.query.ref ? request.query.ref : null
        const retentions = await RetentionWeek.aggregated(platforms, channels, ref)
        reply(retentions)
      } catch (e) {
        console.log(e.message)
        reply(e.toString()).code(500)
      }
    }
  })

  // Daily active users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(DAU_PLATFORM, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Daily active users by platform minus first time runs
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_minus_first',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(DAU_PLATFORM_MINUS_FIRST, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Monthly active users by platform
  server.route({
    method: 'GET',
    path: '/api/1/mau_platform',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(MAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Monthly active u/**/sers
  server.route({
    method: 'GET',
    path: '/api/1/mau',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(MAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Daily new users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      var results = await client.query(DAU_PLATFORM_FIRST, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // daily downloads by plaftorm
  server.route({
    method: 'GET',
    path: '/api/1/daily_downloads',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let day = days.split(' ')
      let cutoff = moment().subtract(Number(day[0]), 'days').format('YYYY-MM-DD')
      var results = await knex('dw.daily_downloads').where('ymd', '>', cutoff ).whereIn('platform', platforms).orderBy('ymd','desc').select(['count','platform','ymd'])
      reply(results)
    }
  })

  // New users by platform summary
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first_summary',
    handler: async function (request, reply) {
      let results = await client.query(DAU_PLATFORM_FIRST_SUMMARY, [])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // New users by platform summary geo and dma
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first_summary_geo',
    handler: function (request, reply) {
      // default to all time
      let days = parseInt(request.query.days || 10000, 10) + ' days'
      client.query(PLATFORM_SUMMARY_GEO, [], (err, results) => {
        if (err) {
          reply(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => { row.downloads = parseInt(row.downloads, 10) })
          var grouped = _.groupBy(results.rows, (row) => { return row.platform })
          _.each(grouped, (records, platform) => {
            var sum = _.reduce(records, (memo, record) => { return memo + record.downloads }, 0)
            _.each(records, (record) => { record.percentage = common.round(record.downloads / sum * 100, 1) })
          })
          reply(grouped)
        }
      })
    }
  })

  // Daily user retention stats
  server.route({
    method: 'GET',
    path: '/api/1/dus',
    handler: function (request, reply) {
      let days = parseInt(request.query.days || 7, 10) + ' days'
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let channels = common.channelPostgresArray(request.query.channelFilter)
      client.query(DELTA, [days, platforms, channels], (err, results) => {
        if (err) {
          reply(err.toString()).code(500)
        } else {
          const columns = ['count', 'prev', 'delta', 'change', 'first_count', 'retention']
          results.rows.forEach((row) => {
            _.each(columns, (column) => {
              row[column] = parseFloat(row[column])
            })
          })
          results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
          reply(results.rows)
        }
      })
    }
  })
}
