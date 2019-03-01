/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const _ = require('lodash')
const moment = require('moment')

const common = require('./common')

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

const DAU_PLATFORM_FIRST_SUMMARY = `SELECT * FROM dw.fc_platform_downloads_summary_mv ORDER BY mobile, vendor`

const PLATFORM_SUMMARY_GEO = `
SELECT 'ios' AS platform, FC.country_code, DM.name, '000' AS dma, FC.downloads
FROM appannie.fc_inception_by_country FC JOIN appannie.dm_countries DM ON FC.country_code = DM.code
`

exports.setup = (server, client, mongo) => {

  // Monthly average daily stats by platform
  server.route({
    method: 'GET',
    path: '/api/1/monthly_average_stats_platform',
    handler: function (request, h) {
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
      return client.query(query_string, (err, results) => {
        if (err) {
          return err.toString()
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
          results.rows.forEach((row) => common.convertPlatformLabels(row))
          results.rows.forEach((row) => {
            row.dau = parseInt(row.dau)
            row.mau = parseInt(row.mau)
            row.first_time = parseInt(row.first_time)
          })
          return results.rows
        }
      })
    }
  })

  // daily downloads by platform
  server.route({
    method: 'GET',
    path: '/api/1/daily_downloads',
    handler: async function (request, h) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let day = days.split(' ')
      let cutoff = moment().subtract(Number(day[0]), 'days').format('YYYY-MM-DD')
      var results = await knex('dw.daily_downloads').where('ymd', '>', cutoff).whereIn('platform', platforms).orderBy('ymd', 'desc').select(['count', 'platform', 'ymd'])
      return results
    }
  })

  // New users by platform summary
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first_summary',
    handler: async function (request, h) {
      let results = await client.query(DAU_PLATFORM_FIRST_SUMMARY, [])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      return results.rows
    }
  })

  // New users by platform summary geo and dma
  server.route({
    method: 'GET',
    path: '/api/1/dau_platform_first_summary_geo',
    handler: function (request, h) {
      // default to all time
      let days = parseInt(request.query.days || 10000, 10) + ' days'
      client.query(PLATFORM_SUMMARY_GEO, [], (err, results) => {
        if (err) {
          h.response(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => { row.downloads = parseInt(row.downloads, 10) })
          var grouped = _.groupBy(results.rows, (row) => { return row.platform })
          _.each(grouped, (records, platform) => {
            var sum = _.reduce(records, (memo, record) => { return memo + record.downloads }, 0)
            _.each(records, (record) => { record.percentage = common.round(record.downloads / sum * 100, 1) })
          })
          return (grouped)
        }
      })
    }
  })

  // Daily user retention stats
  server.route({
    method: 'GET',
    path: '/api/1/dus',
    handler: function (request, h) {
      let days = parseInt(request.query.days || 7, 10) + ' days'
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let channels = common.channelPostgresArray(request.query.channelFilter)
      client.query(DELTA, [days, platforms, channels], (err, results) => {
        if (err) {
          return h.response(err.toString()).code(500)
        } else {
          const columns = ['count', 'prev', 'delta', 'change', 'first_count', 'retention']
          results.rows.forEach((row) => {
            _.each(columns, (column) => {
              row[column] = parseFloat(row[column])
            })
          })
          results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
          return (results.rows)
        }
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/wois',
    handler: (request, h) => {
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
      return h.response(results)
    }
  })
}
