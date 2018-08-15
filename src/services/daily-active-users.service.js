const moment = require('moment')
module.exports = class DailyActiveUsers {

  async platform_minus_first (days, platforms, channels, ref = 'NULL') {
    console.log(`${days} : ${platforms} : ${channels} : ${ref}`)
    // TODO: finish tweaking and implement this
    const dau_platform_minus_first = knex.select('usage.ymd', 'usage.platform', knex.raw('usage.count as all_count'), 'first_count', knex.raw('usage.count - first_count as count'))
      .from(function () {
        this.select('ymd', 'platform')
          .table('dw.fc_usage')
          .where('ymd', '>=', moment().subtract(days, 'days').format('YYYY-MM-DD'))
          .whereIn('platform', platforms)
          .whereIn('channel', channels)
          .where(knex.raw(`ref = COALESCE(${ref},ref)`))
          .groupBy('ymd')
          .groupBy('platform')
          .orderBy('ymd', 'desc')
          .orderBy('platform')
          .sum('total as count')
          .as('usage')
      })
      .join(
        knex.table('dw.fc_usage').where('ymd', '>=', moment().subtract(days, 'days').format('YYYY-MM-DD'))
          .whereIn('platform', platforms)
          .whereIn('channel', channels)
          .where(knex.raw(`ref = COALESCE(${ref},ref)`))
          .where('first_time', true)
          .groupBy('ymd')
          .groupBy('platform')
          .orderBy('ymd', 'desc')
          .orderBy('platform')
          .select('ymd', 'platform')
          .sum('total as first_count')
          .as('first'), function () {
            this.on('usage.ymd', '=', 'first.ymd').andOn('usage.platform', '=', 'first.platform')
          }
      )
    const DAU_PLATFORM_MINUS_FIRST = `
SELECT
  USAGE.ymd,
  USAGE.platform,
  USAGE.count AS all_count,
  FIR.first_count,
  USAGE.count - FIR.first_count AS count
FROM
(
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS count
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref)
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) USAGE JOIN (
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS first_count
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref) AND
  FC.first_time
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) FIR ON USAGE.ymd = FIR.ymd AND USAGE.platform = FIR.platform
ORDER BY USAGE.ymd DESC, USAGE.platform
`

    const results = await global.pg_client.query(DAU_PLATFORM_MINUS_FIRST, [days, platforms, channels, ref])
    return results.rows
  }
}
