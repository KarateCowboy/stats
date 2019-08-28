const {Util} = require('../models/util')
const moment = require('moment')
const _ = require('underscore')

const WEEKLY_RETENTION_START = `
SELECT SUM(FC.total) AS count
FROM dw.fc_agg_usage_weekly FC
WHERE
  fc.woi = $1 AND
  first_time AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = ANY(COALESCE($4, ARRAY[ref])) AND
  FC.woi = ANY(COALESCE($5, ARRAY[woi]))
`

const WEEKLY_RETENTION = `
SELECT SUM(FC.total) AS count
FROM dw.fc_agg_usage_weekly FC
WHERE
  fc.woi = $1 AND
  (FC.ymd >= $2 AND FC.ymd < $3) AND
  FC.platform = ANY ($4) AND
  FC.channel = ANY ($5) AND
  FC.ref = ANY(COALESCE($6, ARRAY[ref])) AND
  FC.woi = ANY(COALESCE($7, ARRAY[woi]))
`

const COUNTRY_RETENTION_DNU = `
SELECT
  country_code AS cc,
  SUM(FC.total) AS count
FROM dw.fc_agg_usage_daily FC
WHERE
  FC.platform = ANY ($1) AND
  FC.channel = ANY ($2) AND
  FC.ref = ANY(COALESCE($3, ARRAY[ref])) AND
  FC.woi = ANY(COALESCE($4, ARRAY[woi])) AND
  first_time
GROUP BY country_code
ORDER BY country_code
`

const COUNTRY_RETENTION_ORGANIC_DNU = `
SELECT
  country_code AS cc,
  SUM(FC.total) AS count
FROM dw.fc_agg_usage_daily FC JOIN dtl.referral_codes REF ON FC.ref = REF.code_text
WHERE
  REF.campaign_id = 39 AND
  FC.platform = ANY ($1) AND
  FC.channel = ANY ($2) AND
  FC.woi = ANY(COALESCE($3, ARRAY[woi])) AND
  first_time
GROUP BY country_code
ORDER BY country_code
`
const COUNTRY_RETENTION_REFERRAL_DNU = `
SELECT
  country_code AS cc,
  SUM(FC.total) AS count
FROM dw.fc_agg_usage_daily FC JOIN dtl.referral_codes REF ON FC.ref = REF.code_text
WHERE
  REF.campaign_id = 42 AND
  FC.platform = ANY ($1) AND
  FC.channel = ANY ($2) AND
  FC.woi = ANY(COALESCE($3, ARRAY[woi])) AND
  first_time
GROUP BY country_code
ORDER BY country_code
`

const COUNTRY_RETENTION_PAID_DNU = `
SELECT
  country_code AS cc,
  SUM(FC.total) AS count
FROM dw.fc_agg_usage_daily FC JOIN dtl.referral_codes REF ON FC.ref = REF.code_text
WHERE
  ( REF.campaign_id <> 42 AND REF.campaign_id <> 39) AND
  FC.platform = ANY ($1) AND
  FC.channel = ANY ($2) AND
  FC.woi = ANY(COALESCE($3, ARRAY[woi])) AND
  first_time
GROUP BY country_code
ORDER BY country_code
`

const COUNTRY_RETENTION_DAU = `
SELECT
  cc,
  to_char(week_start, 'YYYY-MM-DD') as week_start,
  max(count) as count
FROM (
  SELECT
    country_code AS cc,
    date_trunc('week', ymd::date) as week_start,
    ymd::date as ymd,
    SUM(FC.total) AS count
  FROM dw.fc_agg_usage_daily FC
  WHERE
    FC.platform = ANY ($1) AND
    FC.channel = ANY ($2) AND
    FC.ref = ANY(COALESCE($3, ARRAY[ref])) AND
    FC.woi = ANY(COALESCE($4, ARRAY[woi]))
  GROUP BY country_code, date_trunc('week', ymd::date), ymd::date
  ORDER BY country_code, date_trunc('week', ymd::date), ymd::date
) S
GROUP BY cc, week_start
ORDER BY cc, week_start
`

const COUNTRY_RETENTION_ORGANIC_DAU = `
SELECT
  cc,
  to_char(week_start, 'YYYY-MM-DD') as week_start,
  max(count) as count
FROM (
  SELECT
    country_code AS cc,
    date_trunc('week', ymd::date) as week_start,
    ymd::date as ymd,
    SUM(FC.total) AS count
  FROM dw.fc_agg_usage_daily FC JOIN dtl.referral_codes REF ON FC.ref = REF.code_text
  WHERE
    REF.campaign_id = 39 AND
    FC.platform = ANY ($1) AND
    FC.channel = ANY ($2) AND
    FC.woi = ANY(COALESCE($3, ARRAY[woi]))
  GROUP BY country_code, date_trunc('week', ymd::date), ymd::date
  ORDER BY country_code, date_trunc('week', ymd::date), ymd::date
) S
GROUP BY cc, week_start
ORDER BY cc, week_start
`
const COUNTRY_RETENTION_PAID_DAU = `
SELECT
  cc,
  to_char(week_start, 'YYYY-MM-DD') as week_start,
  max(count) as count
FROM (
  SELECT
    country_code AS cc,
    date_trunc('week', ymd::date) as week_start,
    ymd::date as ymd,
    SUM(FC.total) AS count
  FROM dw.fc_agg_usage_daily FC JOIN dtl.referral_codes REF ON FC.ref = REF.code_text
  WHERE
    ( REF.campaign_id <> 39 AND REF.campaign_id <> 42) AND
    FC.platform = ANY ($1) AND
    FC.channel = ANY ($2) AND
    FC.woi = ANY(COALESCE($3, ARRAY[woi]))
  GROUP BY country_code, date_trunc('week', ymd::date), ymd::date
  ORDER BY country_code, date_trunc('week', ymd::date), ymd::date
) S
GROUP BY cc, week_start
ORDER BY cc, week_start
`

const COUNTRY_RETENTION_REFERRAL_DAU = `
SELECT
  cc,
  to_char(week_start, 'YYYY-MM-DD') as week_start,
  max(count) as count
FROM (
  SELECT
    country_code AS cc,
    date_trunc('week', ymd::date) as week_start,
    ymd::date as ymd,
    SUM(FC.total) AS count
  FROM dw.fc_agg_usage_daily FC JOIN dtl.referral_codes REF ON FC.ref = REF.code_text
  WHERE
    REF.campaign_id = 42 AND
    FC.platform = ANY ($1) AND
    FC.channel = ANY ($2) AND
    FC.woi = ANY(COALESCE($3, ARRAY[woi]))
  GROUP BY country_code, date_trunc('week', ymd::date), ymd::date
  ORDER BY country_code, date_trunc('week', ymd::date), ymd::date
) S
GROUP BY cc, week_start
ORDER BY cc, week_start
`

const adCountryCodes = async () => {
  return ['UK','GB','US','CA','FR','DE','AU','NZ','IE','AR','AT','BR','CH','CL','CO','DK','EC','IL','IN','IT','JP','KR','MX','NL','PE','PH','PL','SE','SG','VE','ZA']
}

module.exports = class RetentionService {
  constructor () {
    this.table = 'dw.fc_retention_woi'
    this.platforms = ['ios', 'androidbrowser', 'linux', 'winia32', 'winx64', 'osx', 'linux-bc', 'osx-bc', 'winx64-bc']
  }

  async missing () {
    let missing = {}
    const last_ninety = Util.last_ninety_days().map((d) => { return d.format('YYYY-MM-DD')})
    for (let platform of this.platforms) {
      const ymd = Util.ninety_days_ago().format('YYYY-MM-DD')
      let existing_ymds = await knex('dw.fc_retention_woi').where('platform', platform)
        .where('ymd', '>=', ymd)
        .distinct('ymd')
        .select()
      existing_ymds = existing_ymds.map((o) => moment(o.ymd).format('YYYY-MM-DD'))
      missing[platform] = _.difference(last_ninety, existing_ymds)
    }
    return missing
  }

  static async weeklyRetention (client, params) {
    let SIZE = 13
    let data = []
    let mostRecentMonday = moment().startOf('week').add(1, 'day')
    let firstMonday = mostRecentMonday.clone().subtract(SIZE - 1, 'weeks')
    let currentSize = SIZE
    for (let row = 0; row < SIZE; row += 1) {
      let monday = firstMonday.clone().add(row, 'weeks')
      let s = (await client.query(WEEKLY_RETENTION_START, [
        monday.format('YYYY-MM-DD'),
        params.platforms,
        params.channels,
        params.ref,
        params.wois
      ])).rows[0]
      for (let col = 1; col < currentSize; col += 1) {
        let compMonday = monday.clone().add(col, 'weeks')
        let r = (await client.query(WEEKLY_RETENTION, [
          monday.format('YYYY-MM-DD'),
          compMonday.format('YYYY-MM-DD'),
          compMonday.clone().add(7, 'days').format('YYYY-MM-DD'),
          params.platforms,
          params.channels,
          params.ref,
          params.wois
        ])).rows[0]
        data.push({
          woi: monday.format('YYYY-MM-DD'),
          week_actual: compMonday.format('YYYY-MM-DD'),
          week_delta: col,
          current: r.count,
          starting: s.count,
          retained_percentage: r.count / s.count,
          start: compMonday.format('YYYY-MM-DD'),
          end: compMonday.clone().add(7, 'days').format('YYYY-MM-DD')
        })
      }
      currentSize -= 1
    }
    return JSON.stringify(data)
  }

  static async weeklyCountryRetention (client, params) {
    // wois is required
    if (_.isNull(params.wois) || (params.wois && params.wois.length === 0)) {
      console.log('wois required for weeklyCountryRetention')
      return null
    }

    const regions = JSON.parse(require('fs').readFileSync('./src/isomorphic/countries.json', 'utf-8'))
    const countries = _.flatten(regions.map((region) => {
      return region.subitems
    }))
    const adCountriesMapped = _.object((await adCountryCodes()).map((cc) => {
      return [cc, true]
    }))
    const countriesMapped = _.object(countries.map((country) => {
      return [country.id, {
        label: country.label,
        adCountry: !!adCountriesMapped[country.id]
      }]
    }))

    let { platforms, channels, ref, wois, source } = params

    let DNUQuery = COUNTRY_RETENTION_DNU
    let DAUQuery = COUNTRY_RETENTION_DAU
    let queryParams = [platforms, channels, ref, wois]

    if (source === 'referral') {
      queryParams = [platforms, channels,  wois]
      DNUQuery = COUNTRY_RETENTION_REFERRAL_DNU
      DAUQuery = COUNTRY_RETENTION_REFERRAL_DAU
    } else if (source === 'paid') {
      queryParams = [platforms, channels,  wois]
      DNUQuery = COUNTRY_RETENTION_PAID_DNU
      DAUQuery = COUNTRY_RETENTION_PAID_DAU
    } else if (source === 'organic') {
      queryParams = [platforms, channels,  wois]
      DNUQuery = COUNTRY_RETENTION_ORGANIC_DNU
      DAUQuery = COUNTRY_RETENTION_ORGANIC_DAU
    }

    const ccDNU = (await client.query(DNUQuery, queryParams)).rows
    const ccDAU = (await client.query(DAUQuery, queryParams)).rows

    return {
      dnu: ccDNU,
      dau: ccDAU,
      countries: countriesMapped
    }
  }
}
