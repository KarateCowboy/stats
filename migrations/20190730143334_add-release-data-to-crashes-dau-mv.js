/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_dau_mv')
  const QUERY = `create MATERIALIZED VIEW dw.fc_crashes_dau_mv AS
select
  CRS.ymd,
  CRS.version,
  CRS.platform,
  crashes,
  total as usage,
  crashes / total as crash_rate
from
( select
  sp.to_ymd((contents->>'year_month_day'::text)) AS ymd,
  dtl.releases.brave_version as version,
  sp.canonical_platform(
    COALESCE(contents->>'platform', 'unknown'),
    COALESCE(contents->'metadata'->>'cpu', 'unknown')
  )                                              AS platform,
  COUNT(*)                                       AS crashes
FROM dtl.crashes
join dtl.releases ON dtl.crashes.contents->>'ver' = dtl.releases.chromium_version 
WHERE
  sp.to_ymd((contents->>'year_month_day'::text)) > (current_timestamp - '60 days'::interval)
group by
  sp.to_ymd((contents->>'year_month_day'::text)),
  dtl.releases.brave_version,
  sp.canonical_platform(
    COALESCE(contents->>'platform', 'unknown'),
    COALESCE(contents->'metadata'->>'cpu', 'unknown')
  )
) CRS JOIN (
  SELECT ymd, version, platform, sum(total) as total
  FROM dw.fc_usage
  GROUP BY ymd, version, platform
) USG ON CRS.ymd = USG.ymd AND CRS.version = USG.version AND CRS.platform = USG.platform
WHERE total > 10
ORDER BY total desc
;`
  await knex.raw(QUERY)
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
  COALESCE(contents->>'ver', 'unknown')     AS version,
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
  COALESCE(contents->>'ver', 'unknown'),
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
;`)
}
