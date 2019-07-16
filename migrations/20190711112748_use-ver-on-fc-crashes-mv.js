/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.up = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_mv')
  await knex.raw(`
    CREATE MATERIALIZED VIEW dw.fc_crashes_mv AS
    SELECT
      sp.to_ymd((contents->>'year_month_day'::text))             AS ymd,
      COALESCE(contents->>'ver', contents->>'_version', 'unknown')                 AS version,
      COALESCE(contents->>'platform', 'unknown')                 AS platform,
      COALESCE(contents->'metadata'->>'crash_reason', 'unknown') AS crash_reason,
      COALESCE(contents->'metadata'->>'cpu', 'unknown')          AS cpu,
      COALESCE(contents->'metadata'->>'signature', 'unknown')    AS signature,
      COALESCE(contents->>'channel', '')                         AS channel,
      COUNT(*)                                                   AS total
    FROM dtl.crashes
    WHERE
      sp.to_ymd((contents->>'year_month_day'::text)) > (current_timestamp - '60 days'::interval) AND
      COALESCE(contents->>'ver', '0.0.0.0') <> '0.0.0.0' AND
      COALESCE(contents->>'channel', '') <> ''
    GROUP BY
      sp.to_ymd((contents->>'year_month_day'::text)),
      COALESCE(contents->>'ver', contents->>'_version', 'unknown'),
      COALESCE(contents->>'platform', 'unknown'),
      COALESCE(contents->'metadata'->>'crash_reason', 'unknown'),
      COALESCE(contents->'metadata'->>'cpu', 'unknown'),
      COALESCE(contents->>'channel', ''),
      COALESCE(contents->'metadata'->>'signature', 'unknown')
    ;

  `)
}

exports.down = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.fc_crashes_mv')
  await knex.raw(`
CREATE MATERIALIZED VIEW dw.fc_crashes_mv AS
SELECT
  sp.to_ymd((contents->>'year_month_day'::text))             AS ymd,
  COALESCE(contents->>'_version', 'unknown')                 AS version,
  COALESCE(contents->>'platform', 'unknown')                 AS platform,
  COALESCE(contents->'metadata'->>'crash_reason', 'unknown') AS crash_reason,
  COALESCE(contents->'metadata'->>'cpu', 'unknown')          AS cpu,
  COALESCE(contents->'metadata'->>'signature', 'unknown')    AS signature,
  COUNT(*)                                                   AS total
FROM dtl.crashes
WHERE
  sp.to_ymd((contents->>'year_month_day'::text)) > (current_timestamp - '60 days'::interval) AND
  COALESCE(contents->>'_version', '0.0.0') <> '0.0.0' AND
  COALESCE(contents->>'channel', '') <> ''
GROUP BY
  sp.to_ymd((contents->>'year_month_day'::text)),
  COALESCE(contents->>'_version', 'unknown'),
  COALESCE(contents->>'platform', 'unknown'),
  COALESCE(contents->'metadata'->>'crash_reason', 'unknown'),
  COALESCE(contents->'metadata'->>'cpu', 'unknown'),
  COALESCE(contents->'metadata'->>'signature', 'unknown')
;`)

}
