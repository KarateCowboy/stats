/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const pgc = require('./pgc')
const mgc = require('./mongoc')
const Knex = require('knex')
const server = require('./index')

const run = async () => {
  const pgh = await pgc.setupConnection()
  global.pg_client = pgh
  const mgh = await mgc.setupConnection()
  global.mongo_client = mgh
  global.knex = await Knex({client: 'pg', connection: process.env.DATABASE_URL})
  await server.setup({pg: pgh, mg: mgh, knex: knex})
  await server.kickoff()
}

run()
