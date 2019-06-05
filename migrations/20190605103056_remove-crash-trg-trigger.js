/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.raw('DROP TRIGGER crash_trg ON dtl.crashes')
  await knex.raw('DROP FUNCTION crash_trg')
}

exports.down = async function (knex, Promise) {
  let triggerSql = `
CREATE OR REPLACE FUNCTION crash_trg() RETURNS trigger AS $$
DECLARE
  buf TEXT;
BEGIN
  buf := NEW.id;
  buf := buf || ' ' || COALESCE(NEW.contents->>'guid', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'platform', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'year_month_day', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'_version', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'ver', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'crash_reason', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'list_annotations', '');
  buf := buf || ' ' || COALESCE(NEW.contents->>'crash_id', '');
  IF NEW.contents->'metadata' IS NOT NULL THEN
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'operating_system_version', '');
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'operating_system_name', '');
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'operating_system', '');
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'cpu', '');
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'crash_reason', '');
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'cpu_family', '');
    buf := buf || ' ' || COALESCE(NEW.contents->'metadata'->>'signature', '');
  END IF;
  INSERT INTO dtl.fti (object_type, object_id, searchable)
  VALUES ('crash', NEW.id, to_tsvector('simple', buf))
  ON CONFLICT (object_type, object_id) DO UPDATE SET searchable = to_tsvector('simple', buf);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 CREATE TRIGGER crash_trg BEFORE INSERT OR UPDATE ON dtl.crashes
FOR EACH ROW EXECUTE PROCEDURE crash_trg(); 
  `
  await knex.raw(triggerSql)
}
