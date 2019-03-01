/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var elasticsearch = require('elasticsearch')
var es = new elasticsearch.Client({
  host: process.env.ES_URL || 'localhost:9200',
  log: process.env.ES_LOG_LEVEL || 'warning'
})

const LIMIT = parseInt(process.env.ES_SEARCH_LIMIT || 20)

// Data endpoints
exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/search',
    handler: async (request, h) => {
      // make request to ElasticSearch
      let results = await es.search({
        index: 'crashes',
        type: 'crash',
        body: {
          size: LIMIT,
          sort: [
            { "year_month_day": "desc" }
          ],
          query: {
            match: {
              full_text: {
                query: request.query.query,
                operator: "and"
              }
            }
          }
        }
      })

      // Pull crash data and format response
      let crashes = results.hits.hits.map((h) => { return { contents: h._source } })
      let payload = {
        rowCount: results.hits.hits.length,
        limit: LIMIT,
        crashes: crashes
      }

      return (payload)
    }
  })
}
