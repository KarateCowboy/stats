/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  const funcSql = `
CREATE OR REPLACE FUNCTION sp.canonical_platform(_platform TEXT, _cpu TEXT) RETURNS TEXT AS $$
BEGIN
  IF lower(_platform) = 'win32' OR lower(_platform) = 'win64' THEN
    IF _cpu = 'amd64' THEN
      RETURN 'winx64-bc';
    ELSE
      RETURN 'winia32-bc';
    END IF;
  ELSIF _platform = 'darwin' THEN
    RETURN 'osx';
  ELSEIF _platform = 'linux' THEN
    RETURN 'linux';
  ELSE
    RETURN _platform;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
  `
  await knex.raw(funcSql)
}

exports.down = async function (knex, Promise) {
  const funcSql = `
CREATE OR REPLACE FUNCTION sp.canonical_platform(_platform TEXT, _cpu TEXT) RETURNS TEXT AS $$
BEGIN
  IF _platform = 'win32' THEN
    IF _cpu = 'amd64' THEN
      RETURN 'winx64';
    ELSE
      RETURN 'winia32';
    END IF;
  ELSIF _platform = 'darwin' THEN
    RETURN 'osx';
  ELSEIF _platform = 'linux' THEN
    RETURN 'linux';
  ELSE
    RETURN _platform;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
  `
  await knex.raw(funcSql)
}

