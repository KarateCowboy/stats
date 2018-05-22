/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const pg = require('pg')

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set to the Postgres connection URL')
}

module.exports.setup = async () => {
  console.log('Connecting to Postgres at ' + process.env.DATABASE_URL)
  // Connect to Postgres
  return new Promise((resolve, reject) => {
    pg.connect(process.env.DATABASE_URL, function (err, client) {
      if (err) {
        reject(err)
      }
      resolve(client)
    })
  })
}
