/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('fc_usage', (table) => {
    table.dropPrimary()
  })
  await knex.schema.withSchema('dw').alterTable('fc_usage', (table) => {
    table.increments('id')
    table.unique(['ymd', 'platform', 'version', 'first_time', 'channel', 'ref'])
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('fc_usage', (table) => {
    table.dropColumn('id')
    table.dropUnique(['ymd', 'platform', 'version', 'first_time', 'channel', 'ref'])
    table.primary(['ymd', 'platform', 'version', 'first_time', 'channel', 'ref'])
  })
}
