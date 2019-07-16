/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_dau_mv')
  await knex.raw(`
CREATE MATERIALIZED VIEW dw.fc_crashes_dau_mv AS
SELECT
  CRS.ymd,
  CRS.version,
  CRS.platform,
  CRS.channel,
  crashes,
  total,
  crashes / total AS crash_rate
FROM
( SELECT
  sp.to_ymd((contents->>'year_month_day'::text)) AS ymd,
  COALESCE(contents->>'_version', 'unknown')     AS version,
  sp.canonical_platform(
    COALESCE(contents->>'platform', 'unknown'),
    COALESCE(contents->'metadata'->>'cpu', 'unknown')
  )                                              AS platform,
  COALESCE(contents->>'channel','')              AS channel,
  COUNT(*)                                       AS crashes
FROM dtl.crashes
WHERE
  sp.to_ymd((contents->>'year_month_day'::text)) > (current_timestamp - '60 days'::interval)
GROUP BY
  sp.to_ymd((contents->>'year_month_day'::text)),
  COALESCE(contents->>'_version', 'unknown'),
  sp.canonical_platform(
    COALESCE(contents->>'platform', 'unknown'),
    COALESCE(contents->'metadata'->>'cpu', 'unknown')
  ),
  COALESCE(contents->>'channel','')
) CRS JOIN (
  SELECT ymd, version, platform, channel, sum(total) as total
  FROM dw.fc_usage
  GROUP BY ymd, version, platform, channel
) USG ON CRs.ymd = USG.ymd AND CRS.version = USG.version AND CRS.platform = USG.platform AND CRS.channel = USG.channel
WHERE total > 10
;
  
  `)
}

exports.down = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_dau_mv')
  await knex.raw(`
    CREATE MATERIALIZED VIEW dw.fc_crashes_dau_mv AS
    SELECT
      CRS.ymd,
      CRS.version,
      CRS.platform,
      crashes,
      total,
      crashes / total AS crash_rate
    FROM
    ( SELECT
      sp.to_ymd((contents->>'year_month_day'::text)) AS ymd,
      COALESCE(contents->>'_version', 'unknown')     AS version,
      sp.canonical_platform(
        COALESCE(contents->>'platform', 'unknown'),
        COALESCE(contents->'metadata'->>'cpu', 'unknown')
      )                                              AS platform,
      COUNT(*)                                       AS crashes
    FROM dtl.crashes
    WHERE
      sp.to_ymd((contents->>'year_month_day'::text)) > (current_timestamp - '60 days'::interval)
    GROUP BY
      sp.to_ymd((contents->>'year_month_day'::text)),
      COALESCE(contents->>'_version', 'unknown'),
      sp.canonical_platform(
        COALESCE(contents->>'platform', 'unknown'),
        COALESCE(contents->'metadata'->>'cpu', 'unknown')
      )
    ) CRS JOIN (
      SELECT ymd, version, platform, sum(total) as total
      FROM dw.fc_usage
      GROUP BY ymd, version, platform
    ) USG ON CRs.ymd = USG.ymd AND CRS.version = USG.version AND CRS.platform = USG.platform
    WHERE total > 10
    ;
`)

}
