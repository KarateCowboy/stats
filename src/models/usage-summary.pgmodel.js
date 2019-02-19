/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const moment = require('moment')
const _ = require('lodash')
module.exports = (sequelize, Sequelize) => {
  const UsageSummary = sequelize.define('UsageSummary',
    {
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      ymd: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      platform: {
        type: Sequelize.ENUM('linux', 'linux-bc', 'winia32', 'winia32-bc', 'winx64', 'winx64-bc', 'ios', 'androidbrowser', 'android', 'osx', 'osx-bc')
      },
      version: {
        type: Sequelize.STRING
      },
      first_time: {
        type: Sequelize.BOOLEAN
      },
      total: {type: Sequelize.INTEGER},
      channel: {
        type: Sequelize.ENUM('release', 'stable', 'beta', 'developer', 'nightly', 'dev')
      },
      ref: {
        type: Sequelize.STRING
      }
    }

    , {
      underscored: true,
      schema:
        'dw',
      tableName:
        'fc_usage',
      timestamps:
        true,
      freezeTableName:
        true
    }
  )
  UsageSummary.firstCount = async function (ymd, platforms, channels, ref) {
    const ymd_range = Math.abs(moment(ymd).diff(moment(), 'days'))
    const query = `SELECT
    TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
      FC.platform,
      SUM(FC.total) AS first_count
    FROM dw.fc_usage FC
    WHERE
    FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
    FC.platform = ANY ($2) AND
    FC.channel = ANY ($3) AND
    FC.ref = ANY($4) AND
    FC.first_time
    GROUP BY FC.ymd, FC.platform
    ORDER BY FC.ymd DESC, FC.platform`
    const result = await pg_client.query(query, [ymd_range.toString() + ' days', platforms, channels, ref])
    return result
  }

  UsageSummary.platformMinusFirst = async function (ymd, platforms, channels, ref) {
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
  FC.ref = ANY (COALESCE($4, ARRAY[FC.ref]))
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
  FC.ref = ANY (COALESCE($4, ARRAY[FC.ref])) AND
  FC.first_time
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) FIR ON USAGE.ymd = FIR.ymd AND USAGE.platform = FIR.platform
ORDER BY USAGE.ymd DESC, USAGE.platform
`
    return await pg_client.query(DAU_PLATFORM_MINUS_FIRST, [ymd, platforms, channels, ref])
  }

  UsageSummary.dailyActiveUsers = async function (args, group = []) {
    const tableName = args.common ? 'dw.fc_agg_usage_daily' : 'dw.fc_usage'
    const query = knex(tableName).select(knex.raw(`TO_CHAR(ymd, 'YYYY-MM-DD') as ymd`)).sum({count: 'total'})
      .where('ymd', '>=', moment().subtract(args.daysAgo, 'days').format('YYYY-MM-DD'))
      .whereIn('channel', args.channels)
      .whereIn('platform', args.platforms)
      .groupBy('ymd')
      .orderBy('ymd', 'desc').as('fc')
    if (args.ref !== undefined && _.compact(args.ref).length > 0) {
      query.whereIn('ref', args.ref)
    }
    if (args.wois !== undefined && _.compact(args.wois).length > 0) {
      query.whereIn('woi', args.wois)
    }
    if (group.includes('platform') || group.includes('version')) {
      var day_totals = await pg_client.query(query.toString())
      if (group.includes('platform')) {
        query.select('platform').groupBy('platform')
      }
      if (group.includes('version')) {
        query.select('version').groupBy('version')
      }
      const results = await pg_client.query(query.toString())
      results.rows.forEach(r => { r.daily_percentage = (_.toNumber(r.count) / _.toNumber(_.find(day_totals.rows, {'ymd': r.ymd}).count)) * 100 })
      return results
    } else {
      return await pg_client.query(query.toString())
    }
  }

  UsageSummary.dailyNewUsers = async function (args, group = []) {
    const tableName = args.common ? 'dw.fc_agg_usage_daily' : 'dw.fc_usage'
    const query = knex(tableName).select(knex.raw(`TO_CHAR(ymd, 'YYYY-MM-DD') as ymd`)).sum({count: 'total'})
      .where('ymd', '>=', moment().subtract(args.daysAgo, 'days').format('YYYY-MM-DD'))
      .where('first_time', true)
      .whereIn('channel', args.channels)
      .whereIn('platform', args.platforms)
      .groupBy('ymd')
      .orderBy('ymd', 'desc').as('fc')
    if (args.ref !== undefined && _.compact(args.ref).length > 0) {
      query.whereIn('ref', args.ref)
    }
    if (args.wois !== undefined && _.compact(args.wois).length > 0) {
      query.whereIn('woi', args.wois)
    }
    if (group.includes('platform') || group.includes('version')) {
      var day_totals = await pg_client.query(query.toString())
      if (group.includes('platform')) {
        query.select('platform').groupBy('platform')
      }
      if (group.includes('version')) {
        query.select('version').groupBy('version')
      }
      const results = await pg_client.query(query.toString())
      results.rows.forEach(r => { r.daily_percentage = (_.toNumber(r.count) / _.toNumber(_.find(day_totals.rows, {'ymd': r.ymd}).count)) * 100 })
      return results
    } else {
      return await pg_client.query(query.toString())
    }
  }

  UsageSummary.dauCampaign = async (args) => {
    const QUERY = `
    SELECT
      TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd,
      COALESCE(CMP.name, 'unknown') AS campaign,
      SUM(total) AS count
    FROM
      dw.fc_usage        FC                            LEFT JOIN
      dtl.referral_codes REF ON FC.ref = REF.code_text LEFT JOIN
      dtl.campaigns      CMP ON REF.campaign_id = CMP.id
    WHERE
      FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
      FC.platform = ANY ($2) AND
      FC.channel = ANY ($3)
    GROUP BY
      TO_CHAR(ymd, 'YYYY-MM-DD'),
      cmp.name
    ORDER BY
      TO_CHAR(ymd, 'YYYY-MM-DD'),
      cmp.name
    `
    return (await pg_client.query(QUERY,
      [
        `${args.daysAgo} days`,
        args.platform,
        args.channel
      ]
    )).rows
  }

  UsageSummary.dnuCampaign = async (args) => {
    const QUERY = `
    SELECT
      TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd,
      COALESCE(CMP.name, 'unknown') AS campaign,
      SUM(total) AS count
    FROM
      dw.fc_usage        FC                            LEFT JOIN
      dtl.referral_codes REF ON FC.ref = REF.code_text LEFT JOIN
      dtl.campaigns      CMP ON REF.campaign_id = CMP.id
    WHERE
      FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
      FC.platform = ANY ($2) AND
      FC.channel = ANY ($3) AND
      first_time
    GROUP BY
      TO_CHAR(ymd, 'YYYY-MM-DD'),
      cmp.name
    ORDER BY
      TO_CHAR(ymd, 'YYYY-MM-DD'),
      cmp.name
    `
    return (await pg_client.query(QUERY,
      [
        `${args.daysAgo} days`,
        args.platform,
        args.channel
      ]
    )).rows
  }

  UsageSummary.dauVersion = async function (args) {
    const DAU_VERSION_NO_REF = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.version,
  SUM(FC.total) AS count,
  ROUND(SUM(FC.total) / ( SELECT SUM(total) FROM dw.fc_usage WHERE ymd = FC.ymd AND platform = ANY ($2) AND channel = ANY ($3) ), 3) * 100 AS daily_percentage
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3)
GROUP BY FC.ymd, FC.version
ORDER BY FC.ymd DESC, FC.version`

    const DAU_VERSION_REF = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.version,
  SUM(FC.total) AS count,
  ROUND(SUM(FC.total) / ( SELECT SUM(total) FROM dw.fc_usage WHERE ymd = FC.ymd AND platform = ANY ($2) AND channel = ANY ($3) ), 3) * 100 AS daily_percentage
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = ANY ($4)
GROUP BY FC.ymd, FC.version
ORDER BY FC.ymd DESC, FC.version`

    let results
    if (args.ref) {
      results = await pg_client.query(DAU_VERSION_REF, [`${args.daysAgo} days`, args.platform, args.channel, args.ref])
    } else {
      results = await pg_client.query(DAU_VERSION_NO_REF, [`${args.daysAgo} days`, args.platform, args.channel])
    }
    return results.rows

  }

  return UsageSummary
}


