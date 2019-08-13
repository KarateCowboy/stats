/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_dau_mv')
  const QUERY = `create MATERIALIZED VIEW dw.fc_crashes_dau_mv AS
select
  CRS.ymd,
  CRS.version,
  CRS.chromium_version,
  CRS.platform,
  CRS.channel,
  crashes,
  total as usage,
  crashes / total as crash_rate
from
( select
  sp.to_ymd((contents->>'year_month_day'::text)) AS ymd,
  dtl.releases.brave_version as version,
  dtl.releases.chromium_version as chromium_version,
  contents->>'channel' as channel,
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
  dtl.releases.chromium_version,
  sp.canonical_platform(
    COALESCE(contents->>'platform', 'unknown'),
    COALESCE(contents->'metadata'->>'cpu', 'unknown')
  ),
  contents->>'channel'
) CRS JOIN (
  SELECT ymd, version, platform, channel, sum(total) as total
  FROM dw.fc_usage
  GROUP BY ymd, version, platform, channel
) USG ON CRS.ymd = USG.ymd AND CRS.version = USG.version AND CRS.platform = USG.platform AND CRS.channel = USG.channel
WHERE total > 10
ORDER BY total desc
;`
  await knex.raw(QUERY)
}

exports.down = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_dau_mv')
  const QUERY = `create MATERIALIZED VIEW dw.fc_crashes_dau_mv AS
select
  CRS.ymd,
  CRS.version,
  CRS.chromium_version,
  CRS.platform,
  crashes,
  total as usage,
  crashes / total as crash_rate
from
( select
  sp.to_ymd((contents->>'year_month_day'::text)) AS ymd,
  dtl.releases.brave_version as version,
  dtl.releases.chromium_version as chromium_version,
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
  dtl.releases.chromium_version,
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
