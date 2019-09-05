/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').dropTable('release_crashes')
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').createTable('release_crashes', async (table) => {
    table.increments('id')
    table.integer('release_id')
    table.string('crash_id').unique()
    table.timestamps(true, true)
  })
}
