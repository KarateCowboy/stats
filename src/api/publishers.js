/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var common = require('./common')
var _ = require('underscore')
const ChannelTotal = require('../models/channel_total.model')()
const PublisherTotal = require('../models/publisher_total.model')()
const moment = require('moment')
const PUBLISHERS_OVERVIEW = `
SELECT
  (select count(1) from dtl.publishers) as total, 
  (select count(1) from dtl.publishers where verified) as verified,
  (select count(1) from dtl.publishers where verified) / greatest((select count(1) from dtl.publishers), 1) as verified_per, 
  (select count(1) from dtl.publishers where authorized) as authorized,
  (select count(1) from dtl.publishers where authorized) / greatest((select count(1) from dtl.publishers), 1) as authorized_per
`

const PUBLISHERS_DAILY = `
SELECT
  TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd,
  total,
  verified,
  authorized,
  irs
FROM dw.fc_daily_publishers
WHERE ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-09-01'::date)
ORDER BY ymd
`

// Return an array containing a day offset i.e. ['3 days']
const commonDaysParamsBuilder = (request) => {
  return [parseInt(request.query.days || 7) + ' days']
}

const emptyParamsBuilder = (request) => {
  return []
}

const PUBLISHERS_BUCKETED = 'SELECT * FROM (' + [7, 14, 30, 60, 120].map((days) => {
  return `
SELECT
  ${days} as days,
  sum(total) as total,
  sum(verified) as verified,
  sum(authorized) as authorized,
  sum(irs) as irs
FROM dw.fc_daily_publishers
WHERE ymd >= current_date - CAST('${days} days' as INTERVAL)`
}).join(' UNION ') + ') T ORDER BY T.days ASC'

const PUBLISHERS_DETAILS = `
SELECT * FROM dtl.publishers ORDER BY COALESCE(alexa_rank, audience, 0) DESC 
`

const PUBLISHER_PLATFORMS = `
SELECT * FROM dtl.publisher_platforms ORDER BY ord ASC
`

// Endpoint definitions
exports.setup = (server, client, mongo) => {
  // Publishers overview
  server.route({
    method: 'GET',
    path: '/api/1/publisher/overview',
    handler: common.buildQueryReponseHandler(
      client,
      PUBLISHERS_OVERVIEW,
      (results, request) => {
        var row = results.rows[0]
        _.keys(row).forEach((k) => {
          row[k] = parseFloat(row[k])
        })
        return (row)
      },
      (request) => { return [] }
    )
  })

  server.route({
    method: 'GET',
    path: '/api/1/publishers/daily',
    handler: common.buildQueryReponseHandler(
      client,
      PUBLISHERS_DAILY,
      (results, request) => {
        var rows = _.map(results.rows, (row) => {
          _.keys(row).forEach((k) => {
            if (k !== 'ymd') {
              row[k] = parseFloat(row[k])
            }
          })
          return row
        })
        return (rows)
      },
      commonDaysParamsBuilder
    )
  })

  server.route({
    method: 'GET',
    path: '/api/1/publishers/overview/bucketed',
    handler: common.buildQueryReponseHandler(
      client,
      PUBLISHERS_BUCKETED,
      (results, request) => {
        var rows = _.map(results.rows, (row) => {
          _.keys(row).forEach((k) => {
            row[k] = parseFloat(row[k])
          })
          return row
        })
        return (rows)
      },
      emptyParamsBuilder
    )
  })

  server.route({
    method: 'GET',
    path: '/api/1/publishers/details',
    handler: common.buildQueryReponseHandler(
      client,
      PUBLISHERS_DETAILS,
      (results, request) => {
        return (results.rows)
      },
      emptyParamsBuilder
    )
  })

  server.route({
    method: 'GET',
    path: '/api/1/publishers/platforms',
    handler: async () => {
      return await knex('dtl.publisher_platforms').select('*').orderBy('ord', 'asc')
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/publishers/channel_totals',
    handler: async function (request, h) {
      const result = await ChannelTotal.find({}).sort({createdAt: -1}).limit(1)
      const channel_total = result !== undefined && result.length > 0 ? _.first(result) : (new ChannelTotal())
      return (channel_total.toObject())
    }
  })
  server.route({
    method: 'GET',
    path: '/api/1/publishers/publisher_totals',
    handler: async function (request, h) {
      const daysAgo = parseInt(request.query.days || 7, 10)
      let result
      try {
        result = await db.PublisherSignupDay.query()
          .orderBy('created_at', 'desc')
          .andWhere('ymd', '>', moment().subtract(daysAgo, 'days').format('YYYY-MM-DD'))
        return _.flatten(result.map(r => r.asYmd()))
      } catch (e) {
        console.log(e.message)
        throw e
      }
    }
  })
  server.route({
    method: 'GET',
    path: '/api/1/publishers/totals',
    handler: async function (request, h) {
      const result = await PublisherTotal.find({}).sort({createdAt: -1}).limit(1)
      const publisher_total = result !== null && result.length > 0 ? _.first(result) : (new PublisherTotal())
      return (publisher_total.toObject())
    }
  })

}
