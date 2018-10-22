/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('fc_retention_woi', (table) => {
    table.timestamps(true, true)
  })
  await knex.raw(`
  CREATE TRIGGER updated_at_stamp BEFORE UPDATE
    ON dw.fc_retention_woi FOR EACH ROW EXECUTE PROCEDURE
    refresh_updated_at();
  `)
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('fc_retention_woi', (table) => {
    table.dropTimestamps()
  })
  // await knex.raw(` DROP TRIGGER updated_at_stamp ON dw.fc_retention_woi`)
}
