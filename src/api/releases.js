/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const _ = require('lodash')

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
}
