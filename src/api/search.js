/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var _ = require('underscore')

var tokenize = function (text) {
  return text.split(/\s+/)
}


const SEARCH = `
SELECT 
  c.*
FROM 
  dtl.crashes c LEFT JOIN dtl.fti f ON(f.object_id = c.id)
WHERE
  f.searchable @@ tsquery($1::text)
  OR c.contents ->> 'crash_id' =  $1
  ORDER BY c.contents -> 'ts' DESC
LIMIT 100;`

// Data endpoints
exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/search',
    handler: function (request, reply) {
      var q = tokenize(request.query.query).join('|')
      client.query(SEARCH, [q], (err, results) => {
        if (err) {
          console.log(err)
          reply(err.toString).code(500)
        } else {
          var rowCount = results.rows.length
          results.row = results.rows.slice(0, 100)
          reply({
            crashes: results.rows,
            start: 0,
            limit: 100,
            rowCount: rowCount
          })
        }
      })
    }
  })
}
