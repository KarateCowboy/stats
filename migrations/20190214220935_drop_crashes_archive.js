/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').dropTable('crashes_archive')
}

exports.down = async function (knex, Promise) {
  await knex.raw(`
CREATE TABLE dtl.crashes_archive (
  id TEXT NOT NULL PRIMARY KEY,
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  contents JSONB NOT NULL,
  github_repo TEXT,
  github_issue_number TEXT
);
  `)
}
