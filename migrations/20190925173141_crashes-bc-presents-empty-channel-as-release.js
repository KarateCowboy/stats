exports.up = async (knex) => {
  await knex.raw(`drop view dtl.crashes_bc`)
  await knex.raw(`
     CREATE VIEW dtl.crashes_bc AS
    SELECT
      *,
      CASE
        WHEN contents->>'plat' = 'Win64' THEN 'winx64-bc'
        WHEN contents->>'plat' = 'Win32' THEN 'winia32-bc'
        WHEN contents->>'plat' = 'OS X' THEN 'osx-bc'
        ELSE 'linux-bc'
      END AS platform,
      CASE
        WHEN contents->>'channel' IS NULL THEN 'release'
        WHEN contents->>'channel' = '' THEN 'release'
        ELSE contents->>'channel'
        END AS channel,
      (regexp_split_to_array(contents->>'ver', '\\.')::int[])[1]                 AS chromium_major_version
    FROM dtl.crashes
    WHERE
      contents->>'ver' ~ '^\\d+\\.\\d+\\.\\d+\\.\\d+$' AND
      (regexp_split_to_array(contents->>'ver', '\\.')::int[])[1] > 69`)
}

exports.down = async (knex) => {
  await knex.raw('DROP VIEW dtl.crashes_bc')
  await knex.raw(`
     CREATE VIEW dtl.crashes_bc AS
    SELECT
      *,
      CASE
        WHEN contents->>'plat' = 'Win64' THEN 'winx64-bc'
        WHEN contents->>'plat' = 'Win32' THEN 'winia32-bc'
        WHEN contents->>'plat' = 'OS X' THEN 'osx-bc'
        ELSE 'linux-bc'
      END AS platform,
      COALESCE(contents->>'channel', 'unknown') as channel,
      (regexp_split_to_array(contents->>'ver', '\\.')::int[])[1]                 AS chromium_major_version
    FROM dtl.crashes
    WHERE
      contents->>'ver' ~ '^\\d+\\.\\d+\\.\\d+\\.\\d+$' AND
      (regexp_split_to_array(contents->>'ver', '\\.')::int[])[1] > 69`)
}
