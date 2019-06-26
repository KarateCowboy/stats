/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('publisher_signup_days', (table) => {
    table.integer('kyc_uphold_and_email_verified')
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('publisher_signup_days', (table) => {
    table.dropColumn('kyc_uphold_and_email_verified')
  })
}
