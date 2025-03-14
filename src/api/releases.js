/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global db  */
const _ = require('lodash')
const moment = require('moment')
exports.setup = (server, client, mongo) => {
  // Crash reports
  server.route({
    method: 'POST',
    path: '/api/1/releases',
    handler: async (request, h) => {
      const braveVersion = request.payload.brave_version
      const chromiumVersion = request.payload.chromium_version
      try {
        const newRelease = await db.Release.query().insert({
          brave_version: braveVersion,
          chromium_version: chromiumVersion
        })
        return newRelease.toJSON()
      } catch (e) {
        return h.response(e.toString()).code(500)
      }
    }
  })
  server.route({
    method: 'GET',
    path: '/api/1/releases',
    handler: async function (request, h) {
      try {
        const sixtyDaysAgo = moment().subtract(60, 'days').format('YYYY-MM-DD')
        const validVersions = await db.Release.query().whereExists(db.Release.relatedQuery('crashes').whereRaw(`contents->>'year_month_day' > '${sixtyDaysAgo}'`))
        return _.sortBy(validVersions, 'brave_version').reverse()
      } catch (e) {
        console.log(e)
        return h.response(e.toString()).code(500)
      }
    }
  })
}
