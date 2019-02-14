/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const common = require('./common')
const dataset = require('./dataset')

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
  FC.ref = ANY (COALESCE($4, ARRAY[FC.ref]))
GROUP BY FC.ymd, FC.platform
ORDER BY FC.ymd DESC, FC.platform
`

exports.setup = (server, client, mongo) => {

  // Daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
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

  // Daily new users
  server.route({
    method: 'GET',
    path: '/api/1/daily_new_users',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      const args = {
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref
      }
      if (!ref) delete args.ref
      let results = await db.UsageSummary.dailyNewUsers(args)
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Daily active users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
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
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      const results = await db.UsageSummary.platformMinusFirst(days, platforms, channels, ref)
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Version for today's daily active users
  server.route({
    method: 'GET',
    path: '/api/1/versions',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let args = {
        daysAgo: days,
        platform: platforms,
        channel: channels
      }
      if (ref) args.ref = ref
      let results = await db.UsageSummary.dauVersion(args)
      results.forEach((row) => common.formatPGRow(row))
      // condense small version counts to an 'other' category
      results = dataset.condense(results, 'ymd', 'version')
      results = common.potentiallyFilterToday(results, request.query.showToday === 'true')
      reply(results)
    }
  })

  // Daily new users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first',
    handler: async function (request, reply) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      const results = await client.query(DAU_PLATFORM_FIRST, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })
}
