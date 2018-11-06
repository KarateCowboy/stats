/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_wallets_mv')
  await knex.schema.withSchema('dw').createTable('fc_wallets', (table) => {
    table.increments('id')
    table.date('created')
    table.integer('contributed')
    table.string('wallets')
    table.decimal('walletProviderBalance', 50,2)
    table.integer('anyFunds')
    table.integer('activeGrant')
    table.integer('walletProviderFunded')
    table.timestamps(true, true)
  })
  await knex.raw(`
  CREATE TRIGGER updated_at_stamp BEFORE UPDATE
    ON dw.fc_wallets FOR EACH ROW EXECUTE PROCEDURE
    refresh_updated_at();
  `)
}

exports.down = async function (knex, Promise) {
  await knex.raw('DROP TRIGGER updated_at_stamp ON dw.fc_wallets') 
  await knex.schema.withSchema('dw').dropTableIfExists('fc_wallets')
  await knex.raw(`
 CREATE MATERIALIZED VIEW dw.fc_wallets_mv AS
SELECT
  created,
  wallets,
  balance,
  funded
FROM
( SELECT
  created,
  COUNT(1) as wallets,
  SUM(financial_balance) as balance,
  ( SELECT count(1) FROM dtl.eyeshade_wallets WHERE created = EW.created and financial_balance > 0) AS funded
FROM dtl.eyeshade_wallets EW
GROUP BY created ) VW
;
  `)
}
