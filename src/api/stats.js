/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const _ = require('lodash')
var assert = require('assert')

var dataset = require('./dataset')
var common = require('./common')
const RetentionWeek = require('../models/retention').RetentionWeek
const moment = require('moment')

const arrayIsTruthy = (a) => {
  return a !== undefined && _.compact(a).length > 0
}

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

const AVERAGE_MONTHLY_DAU_REF = `
SELECT ymd, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY($3)
GROUP BY ymd
ORDER BY ymd DESC
`
const AVERAGE_MONTHLY_DAU_NO_REF = `
SELECT ymd, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) 
GROUP BY ymd
ORDER BY ymd DESC
`

const AVERAGE_MONTHLY_DAU_PLATFORM_REF = `
SELECT ymd, platform, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY ($3)
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`
const AVERAGE_MONTHLY_DAU_PLATFORM_NO_REF = `
SELECT ymd, platform, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) 
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

const AVERAGE_MONTHLY_FIRST_DAU_REF = `
SELECT ymd, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY($3)
GROUP BY ymd
ORDER BY ymd DESC
`
const AVERAGE_MONTHLY_FIRST_DAU_NO_REF = `
SELECT ymd, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) 
GROUP BY ymd
ORDER BY ymd DESC
`

const AVERAGE_MONTHLY_FIRST_DAU_PLATFORM_NO_REF = `
SELECT ymd, platform, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) 
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

const AVERAGE_MONTHLY_FIRST_DAU_PLATFORM_REF = `
SELECT ymd, platform, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY ($3) 
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

const MAU_PLATFORM_REF = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  platform,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ymd > '2016-01-31' AND
  ref = ANY($3)
GROUP BY
  left(ymd::text, 7),
  platform
ORDER BY
  left(ymd::text, 7),
 platform
`
const MAU_PLATFORM_NO_REF = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  platform,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ymd > '2016-01-31'
GROUP BY
  left(ymd::text, 7),
  platform
ORDER BY
  left(ymd::text, 7),
 platform
`

const MAU_REF = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ymd > '2016-01-31' AND
  ref = ANY($3)
GROUP BY
  left(ymd::text, 7)
ORDER BY
  left(ymd::text, 7)
`
const MAU_NO_REF = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ymd > '2016-01-31'
GROUP BY
  left(ymd::text, 7)
ORDER BY
  left(ymd::text, 7)
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
  FC.channel = ANY ($3)
GROUP BY FC.ymd, FC.platform
ORDER BY FC.ymd DESC, FC.platform
`

const DAU_PLATFORM_FIRST_REF = `
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
  FC.ref = ANY ($4)
GROUP BY FC.ymd, FC.platform
ORDER BY FC.ymd DESC, FC.platform
`
const DAU_PLATFORM_FIRST_NO_REF = `
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
  FC.channel = ANY ($3) 

GROUP BY FC.ymd, FC.platform
ORDER BY FC.ymd DESC, FC.platform`

const DAU_PLATFORM_FIRST_SUMMARY = `SELECT * FROM dw.fc_platform_downloads_summary_mv ORDER BY mobile, vendor`

const PLATFORM_SUMMARY_GEO = `
SELECT 'ios' AS platform, FC.country_code, DM.name, '000' AS dma, FC.downloads
FROM appannie.fc_inception_by_country FC JOIN appannie.dm_countries DM ON FC.country_code = DM.code
`

// Data endpoints
exports.setup = (server, client, mongo) => {
  assert(mongo, 'mongo configured')

  function retrieveCommonParameters (request) {
    let days = parseInt(request.query.days || 7, 10) + ' days'
    let platforms = common.platformPostgresArray(request.query.platformFilter)
    let channels = common.channelPostgresArray(request.query.channelFilter)
    let ref = request.query.ref === undefined ? null : request.query.ref.split(',')
    let wois = request.query.wois === undefined ? null : request.query.wois.split(',')
    return [days, platforms, channels, ref, wois]
  }

  // Version for today's daily active users
  server.route({
    method: 'GET',
    path: '/api/1/versions',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let query, args
      args = {
        daysAgo: days,
        platform: platforms,
        channel: channels
      }
      if (arrayIsTruthy(ref)) {
        args.ref = ref
      }
      let results = await db.UsageSummary.dauVersion(args)
      results.forEach((row) => common.formatPGRow(row))
      // condense small version counts to an 'other' category
      results = dataset.condense(results, 'ymd', 'version')
      results = common.potentiallyFilterToday(results, request.query.showToday === 'true')
      reply(results)
    }
  })

  // Daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let results = await db.UsageSummary.dailyActiveUsers({
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref
      })

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
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let query, args
      if (arrayIsTruthy(ref)) {
        query = AVERAGE_MONTHLY_DAU_REF
        args = [platforms, channels, ref]
      } else {
        query = AVERAGE_MONTHLY_DAU_NO_REF
        args = [platforms, channels]
      }
      let results = await client.query(query, args)
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
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let query, args
      if (arrayIsTruthy(ref)) {
        query = AVERAGE_MONTHLY_DAU_PLATFORM_REF
        args = [platforms, channels, ref]
      } else {
        query = AVERAGE_MONTHLY_DAU_PLATFORM_NO_REF
        args = [platforms, channels]
      }
      let results = await client.query(query, args)

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
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let query, args
      if (arrayIsTruthy(ref)) {
        query = AVERAGE_MONTHLY_FIRST_DAU_REF
        args = [platforms, channels, ref]
      } else {
        query = AVERAGE_MONTHLY_FIRST_DAU_NO_REF
        args = [platforms, channels]
      }
      let results = await client.query(query, args)

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
      let results
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      if (arrayIsTruthy(ref)) {
        results = await client.query(AVERAGE_MONTHLY_FIRST_DAU_PLATFORM_REF, [platforms, channels, ref])
      } else {
        results = await client.query(AVERAGE_MONTHLY_FIRST_DAU_PLATFORM_NO_REF, [platforms, channels])
      }
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

  // Daily active users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let results = await db.UsageSummary.dailyActiveUsers({
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref
      }, ['platform'])

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
      const results = await db.UsageSummary.platformMinusFirst(days, platforms, channels, ref)
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
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let query, args
      if (arrayIsTruthy(ref)) {
        query = MAU_PLATFORM_REF
        args = [platforms, channels, ref]
      } else {
        query = MAU_PLATFORM_NO_REF
        args = [platforms, channels]
      }
      let results = await client.query(query, args)

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
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let query, args
      if (arrayIsTruthy(ref)) {
        query = MAU_REF
        args = [platforms, channels, ref]
      } else {
        query = MAU_NO_REF
        args = [platforms, channels]
      }
      let results = await client.query(query, args)

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
      let results
      if (ref !== undefined && _.compact(ref).length > 0) {
        results = await client.query(DAU_PLATFORM_FIRST_REF, [days, platforms, channels, ref])
      } else {
        results = await client.query(DAU_PLATFORM_FIRST_NO_REF, [days, platforms, channels])

      }

      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Daily new users
  server.route({
    method: 'GET',
    path: '/api/1/daily_new_users',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = retrieveCommonParameters(request)
      const args = {
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref
      }
      if(_.isEmpty(_.compact(ref))){
         delete args.ref
      }
      let results = await db.UsageSummary.dailyNewUsers(args)
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // daily downloads by platform
  server.route({
    method: 'GET',
    path: '/api/1/daily_downloads',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = retrieveCommonParameters(request)
      let day = days.split(' ')
      let cutoff = moment().subtract(Number(day[0]), 'days').format('YYYY-MM-DD')
      var results = await knex('dw.daily_downloads').where('ymd', '>', cutoff).whereIn('platform', platforms).orderBy('ymd', 'desc').select(['count', 'platform', 'ymd'])
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

  server.route({
    method: 'GET',
    path: '/api/1/wois',
    handler: (request, reply) => {
      const now = moment().startOf('isoWeek')
      let currentMonth = now.format('MMMM YYYY')
      let results = []
      let current = {
        id: currentMonth,
        label: currentMonth,
        subitems: []
      }
      while (now.format('YYYY-MM-DD') > '2018-01-01') {
        if (now.format('MMMM YYYY') !== currentMonth) {
          results.push(current)
          currentMonth = now.format('MMMM YYYY')
          current = {
            id: currentMonth,
            label: currentMonth,
            subitems: []
          }
        }
        current.subitems.push({
          id: now.format('YYYY-MM-DD'),
          label: now.format('MMMM DD, YYYY'),
        })
        now.subtract(7, 'days')
      }
      results.push(current)
      reply(results)
    }
  })
}
