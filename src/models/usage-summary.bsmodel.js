/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const moment = require('moment')
const _ = require('lodash')
const Joi = require('joi')
const Schema = require('./validators/usage-summary')
const dataset = require('../api/dataset')

module.exports = (knex) => {
  const BaseModel = require('./base_model')(knex)

  class UsageSummary extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dw.fc_usage'
    }

    static basicDau () {
      return this.query().select('ymd', 'platform', 'version').sum({ count: 'total' }).groupBy('ymd', 'platform', 'version')
    }

    static get relationMappings () {
      return {
        release: {
          relation: BaseModel.BelongsToOneRelation,
          modelClass: db.Release,
          join: {
            from: 'dw.fc_usage.version',
            to: 'dtl.releases.brave_version'
          }
        }
      }

    }
  }

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
    const query = knex(tableName).select(knex.raw(`TO_CHAR(ymd, 'YYYY-MM-DD') as ymd`)).sum({ count: 'total' })
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
    if (args.countryCodes !== undefined && _.compact(args.countryCodes).length > 0) {
      query.whereIn('country_code', args.countryCodes)
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
      results.rows.forEach(r => { r.daily_percentage = (_.toNumber(r.count) / _.toNumber(_.find(day_totals.rows, { 'ymd': r.ymd }).count)) * 100 })
      return results
    } else {
      return await pg_client.query(query.toString())
    }
  }

  UsageSummary.dailyNewUsers = async function (args, group = []) {
    const tableName = args.common ? 'dw.fc_agg_usage_daily' : 'dw.fc_usage'
    const query = knex(tableName).select(knex.raw(`TO_CHAR(ymd, 'YYYY-MM-DD') as ymd`)).sum({ count: 'total' })
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
    if (args.countryCodes !== undefined && _.compact(args.countryCodes).length > 0) {
      query.whereIn('country_code', args.countryCodes)
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
      results.rows.forEach(r => { r.daily_percentage = (_.toNumber(r.count) / _.toNumber(_.find(day_totals.rows, { 'ymd': r.ymd }).count)) * 100 })
      return results
    } else {
      return await pg_client.query(query.toString())
    }
  }

  UsageSummary.dauCampaignAgg = async (args) => {
    const QUERY = `
    SELECT
      TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd,
      COALESCE(CMP.name, 'unknown') AS campaign,
      SUM(total) AS count
    FROM
      dw.fc_agg_usage_daily FC                            LEFT JOIN
      dtl.referral_codes    REF ON FC.ref = REF.code_text LEFT JOIN
      dtl.campaigns         CMP ON REF.campaign_id = CMP.id
    WHERE
      FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
      FC.platform = ANY ($2) AND
      FC.channel = ANY ($3) AND
      FC.ref = ANY (COALESCE($4, ARRAY[FC.ref])) AND
      FC.woi = ANY (COALESCE($5, ARRAY[FC.woi])) AND
      FC.country_code = ANY (COALESCE($6, ARRAY[FC.country_code]))
    GROUP BY
      TO_CHAR(ymd, 'YYYY-MM-DD'),
      cmp.name
    ORDER BY
      TO_CHAR(ymd, 'YYYY-MM-DD') DESC,
      cmp.name
    `
    return (await pg_client.query(QUERY,
      [
        `${args.daysAgo} days`,
        args.platforms,
        args.channels,
        args.ref,
        args.wois,
        args.countryCodes
      ]
    ))
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

  UsageSummary.dnuCampaignAgg = async (args) => {
    const QUERY = `
    SELECT
      TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd,
      COALESCE(CMP.name, 'unknown') AS campaign,
      SUM(total) AS count
    FROM
      dw.fc_agg_usage_daily FC                            LEFT JOIN
      dtl.referral_codes    REF ON FC.ref = REF.code_text LEFT JOIN
      dtl.campaigns         CMP ON REF.campaign_id = CMP.id
    WHERE
      FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
      FC.platform = ANY ($2) AND
      FC.channel = ANY ($3) AND
      FC.ref = ANY (COALESCE($4, ARRAY[FC.ref])) AND
      FC.woi = ANY (COALESCE($5, ARRAY[FC.woi])) AND
      FC.country_code = ANY (COALESCE($6, ARRAY[FC.country_code])) AND
      first_time
    GROUP BY
      TO_CHAR(ymd, 'YYYY-MM-DD'),
      cmp.name
    ORDER BY
      TO_CHAR(ymd, 'YYYY-MM-DD') DESC,
      cmp.name
    `
    return (await pg_client.query(QUERY,
      [
        `${args.daysAgo} days`,
        args.platforms,
        args.channels,
        args.ref,
        args.wois,
        args.countryCodes
      ]
    ))
  }

  UsageSummary.druCampaign = async (args) => {
    const QUERY = `
    SELECT
      DAU.ymd,
      DAU.campaign,
      DAU.count - DNU.count AS count
    FROM (
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
    ) DAU JOIN (
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
    ) DNU ON DAU.ymd = DNU.ymd AND DAU.campaign = DNU.campaign
    `
    return (await pg_client.query(QUERY,
      [
        `${args.daysAgo} days`,
        args.platform,
        args.channel
      ]
    )).rows
  }

  UsageSummary.dauByCountry = async (args) => {
    const DAU_QUERY = `
    SELECT
      TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
      COALESCE(CMP.name, 'unknown') AS campaign,
      FC.country_code,
      SUM(FC.total) AS count
    FROM
      dw.fc_agg_usage_daily FC                              LEFT JOIN
      dtl.referral_codes    REF ON FC.ref = REF.code_text   LEFT JOIN
      dtl.campaigns         CMP ON REF.campaign_id = CMP.id
    WHERE
      FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2019-02-21'::date) AND
      FC.platform = ANY ($2) AND
      FC.channel = ANY ($3) AND
      FC.ref = ANY (COALESCE($4, ARRAY[FC.ref])) AND
      FC.woi = ANY (COALESCE($5, ARRAY[FC.woi])) AND
      FC.country_code = ANY (COALESCE($6, ARRAY[FC.country_code]))
    GROUP BY FC.ymd, COALESCE(CMP.name, 'unknown'), FC.country_code
    ORDER BY FC.ymd DESC, COALESCE(CMP.name, 'unknown'), FC.country_code
    `
    const dbParams = [`${args.daysAgo} days`, args.platforms, args.channels, args.ref, args.wois, args.countryCodes]
    const results = await pg_client.query(DAU_QUERY, dbParams)
    return results
  }

  UsageSummary.dauVersion = async function (args) {
    const DAU_VERSION_NO_REF = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.version,
  SUM(FC.total) AS count
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
  SUM(FC.total) AS count
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


