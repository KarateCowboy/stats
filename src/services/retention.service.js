const {Util} = require('../models/util')
const moment = require('moment')
const _ = require('underscore')

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

const refsFromSource = async (client, source) => {
  return {
    referral: async () => { return (await client.query('SELECT code_text AS referral_code FROM dtl.referral_codes WHERE campaign_id = 42', [])).rows.map((r) => { return r.referral_code }) },
    paid: async () => { return (await client.query('SELECT code_text AS referral_code FROM dtl.referral_codes WHERE campaign_id <> 42', [])).rows.map((r) => { return r.referral_code }) },
    organic: async () => { return ['none', 'BRV001'] },
    all: async () => { return null }
  }[source]()
}

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

    // potentially override the ref based on the source (organic, referral, paid)
    if (source !== 'all') {
      ref = await refsFromSource(client, source)
    }

    const ccDNU = (await client.query(COUNTRY_RETENTION_DNU, [platforms, channels, ref, wois])).rows
    const ccDAU = (await client.query(COUNTRY_RETENTION_DAU, [platforms, channels, ref, wois])).rows

    return {
      dnu: ccDNU,
      dau: ccDAU,
      countries: countriesMapped
    }
  }
}
