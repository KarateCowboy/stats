/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const common = require('./common')
const dataset = require('./dataset')
const _ = require('lodash')
const ml = require('ml-distance')
const moment = require('moment')
const remote = require('../remote-job')

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

exports.setup = (server, client, mongo, ch) => {

  // Daily active users by country
  server.route({
    method: 'GET',
    path: '/api/1/dau_cc',
    handler: remote.jobHandler(client, ch, 'dau-country')
  })

  // Daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau',
    handler: async function (request, h) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await db.UsageSummary.dailyActiveUsers({
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref
      })
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      return (results.rows)
    }
  })

  // Daily new users
  server.route({
    method: 'GET',
    path: '/api/1/daily_new_users',
    handler: async function (request, h) {
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
      return (results.rows)
    }
  })

  // Daily active users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform',
    handler: async function (request, h) {
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
      return (results.rows)
    }
  })

  // Daily active users by platform minus first time runs
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_minus_first',
    handler: async function (request, h) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      const results = await db.UsageSummary.platformMinusFirst(days, platforms, channels, ref)
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      return (results.rows)
    }
  })

  // Version for today's daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_by_version',
    handler: async function (request, h) {
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
      return (results)
    }
  })

  const correlate = (results, fld, valueFld = 'count') => {
    if (_.isEmpty(results)) {
      return {}
    }
    const sorted = _.sortBy(results, 'ymd')
    const maxLabel = sorted[sorted.length - 1].ymd
    const minLabel = sorted[0].ymd

    const grouped = _.groupBy(results, (result) => { return result[fld] })
    const labels = []
    const values = []

    _.each(grouped, (lst, k) => {
      labels.push(k)
      let vs = []
      for (let d = moment(minLabel); d.isBefore(moment(maxLabel)); d.add(1, 'day')) {
        let found = lst.find((row) => {
          return row.ymd == d.format('YYYY-MM-DD')
        })
        if (found) {
          vs.push(found.count)
        } else {
          vs.push(0)
        }
      }
      values.push(vs)
    })
    const correlations = {}
    _.each(labels, (v1, i) => {
      _.each(labels, (v2, j) => {
        correlations[`${labels[i]}:${labels[j]}`] = ml.similarity.pearson(values[i], values[j])
      })
    })
    return correlations
  }

  // Campaign for today's daily returning users
  server.route({
    method: 'GET',
    path: '/api/1/dru_campaign',
    handler: async (request, h) => {
      let [days, platforms, channels] = common.retrieveCommonParameters(request)
      let args = {
        daysAgo: days,
        platform: platforms,
        channel: channels
      }
      let results = await db.UsageSummary.druCampaign(args)
      results.forEach((row) => common.formatPGRow(row))
      // condense small campaign counts to an 'other' category
      results = dataset.condense(results, 'ymd', 'campaign', 0.001)
      results = common.potentiallyFilterToday(results, request.query.showToday === 'true')
      const correlations = correlate(results, 'campaign')
      return ({
        results,
        correlations
      })
    }
  })

  // Campaign for today's daily new users
  server.route({
    method: 'GET',
    path: '/api/1/dnu_campaign',
    handler: async (request, h) => {
      let [days, platforms, channels] = common.retrieveCommonParameters(request)
      let args = {
        daysAgo: days,
        platform: platforms,
        channel: channels
      }
      let results = await db.UsageSummary.dnuCampaign(args)
      results.forEach((row) => common.formatPGRow(row))
      // condense small campaign counts to an 'other' category
      results = dataset.condense(results, 'ymd', 'campaign', 0.001)
      results = common.potentiallyFilterToday(results, request.query.showToday === 'true')
      correlate(results, 'campaign')
      return (results)
    }
  })

  // Campaign for today's daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_campaign',
    handler: async (request, h) => {
      let [days, platforms, channels] = common.retrieveCommonParameters(request)
      let args = {
        daysAgo: days,
        platform: platforms,
        channel: channels
      }
      let results = await db.UsageSummary.dauCampaign(args)
      results.forEach((row) => common.formatPGRow(row))
      // condense small campaign counts to an 'other' category
      results = dataset.condense(results, 'ymd', 'campaign', 0.001)
      results = common.potentiallyFilterToday(results, request.query.showToday === 'true')
      correlate(results, 'campaign')
      return (results)
    }
  })

  // Daily new users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first',
    handler: async function (request, h) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      const results = await client.query(DAU_PLATFORM_FIRST, [days, platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      return (results.rows)
    }
  })
}
