/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').createTable('referral_codes', (table) => {
    table.increments('id')
    table.string('code_text')
    table.integer('campaign_id')
    table.timestamps(true, true)
    table.unique(['campaign_id', 'code_text'])
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.dropTable('dtl.referral_codes')
}
