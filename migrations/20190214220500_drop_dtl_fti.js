/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dtl').dropTable('fti')
}

exports.down = async function (knex, Promise) {
  await knex.raw(`
CREATE TABLE dtl.fti (
  id          BIGSERIAL NOT NULL PRIMARY KEY,
  object_type TEXT      NOT NULL REFERENCES dtl.object_types(object_type),
  object_id   TEXT      NOT NULL,
  searchable  TSVECTOR  NOT NULL,
  UNIQUE(object_type, object_id)
);

CREATE INDEX fti_searchable ON dtl.fti USING GIN (searchable);
  `)
}
