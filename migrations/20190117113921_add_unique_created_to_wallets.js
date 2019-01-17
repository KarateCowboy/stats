/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('fc_wallets', (table) => {
    table.unique('created')
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('fc_wallets', (table) => {
    table.dropUnique('created')
  })
}
