/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').createTable('releases', async (table) => {
    table.increments('id')
    table.string('chromium_version')
    table.string('brave_version')
    table.boolean('uses_hybrid_format').default(false)
    table.timestamps(true, true)
    table.unique(['chromium_version', 'brave_version'])
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').dropTable('releases')
}
