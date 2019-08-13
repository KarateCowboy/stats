/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  const funcSql = `
CREATE OR REPLACE FUNCTION sp.canonical_platform(_platform TEXT, _cpu TEXT) RETURNS TEXT AS $$
BEGIN
  IF lower(_platform) IN ('win32', 'winia32') OR lower(_platform) = 'win64' or lower(_platform) = 'winx64' THEN
    IF _cpu = 'amd64' THEN
      RETURN 'winx64-bc';
    ELSE
      RETURN 'winia32-bc';
    END IF;
  ELSIF lower(_platform) = 'osx' OR lower(_platform) IN ('osx','os x', 'darwin') THEN
    RETURN 'osx-bc';
  ELSEIF lower(_platform) = 'linux' THEN
    RETURN 'linux-bc';
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
  IF lower(_platform) IN ('win32', 'winia32') OR lower(_platform) = 'win64' or lower(_platform) = 'winx64' THEN
    IF _cpu = 'amd64' THEN
      RETURN 'winx64-bc';
    ELSE
      RETURN 'winia32-bc';
    END IF;
  ELSIF lower(_platform) = 'osx' OR lower(_platform) IN ('osx','os x', 'darwin') THEN
    RETURN 'osx';
  ELSEIF lower(_platform) = 'linux' THEN
    RETURN 'linux-bc';
  ELSE
    RETURN _platform;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
  `
  await knex.raw(funcSql)

}
