exports.up = async (knex) => {
  await knex.raw('drop view dtl.crashes_bc')
}

exports.down = async (knex) => {
  await knex.raw(`
     CREATE VIEW dtl.crashes_bc AS
    SELECT
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
      is_core = true
      AND has_valid_version = true
      AND sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - cast('130 days' as interval)
      `)
}
