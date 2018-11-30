const _ = require('underscore')
const retriever = require('../retriever')
const model = require('../model')
const { ReferralCode } = require('../models/referral_code')

module.exports = class UpdateMonth {
  async main (collection, start, end) {
    let upsertMaker = model.usageMonthlyUpserter
    if (collection === 'ios_usage') {
      upsertMaker = model.usageiOSMonthlyUpserter
    }
    let results = await retriever.monthlyUsersByDay(global.mongo_client, collection, start, end)
    console.log('Update monthly totals for ' + collection)
    // disambiguate between Link Bubble and tabbed browser
    if (collection === 'android_usage') {
      results.forEach(function (result) {
        result._id.platform = 'androidbrowser'
      })
    }
    results.forEach((result) => {
      result._id.woi = result._id.woi || '2016-01-04'
      result._id.ref = result._id.ref || 'none'
    })
    // filter out wrong version formats
    results = results.filter(function (result) {
      return result._id.version.match(new RegExp('^\\d+\\.\\d+\\.\\d+$')) && ['dev', 'stable', 'beta', 'release'].includes(result._id.channel) && result._id.ymd
    })

    // filter out duplicate ios entries
    if (collection === 'ios_usage') {
      console.log('limiting ios records to ones on or after 2018-01-01')
      results = results.filter(function (results) {
        return results._id.ymd >= '2018-01-01'
      })
    }

    console.log('Updating ' + results.length + ' rows')
    // Insert rows
    for (let row of results) {
      try {
        await upsertMaker(global.pg_client, row)
      } catch (e) {
        console.log(e.message)
        if (!e.message.includes('invalid byte sequence')) {
          throw new Error(e)
        }
      }
    }
    await this.importExceptions()
<<<<<<< HEAD
    const usage_refs = (await knex('dw.fc_usage_month').distinct('ref', 'platform'))
    const grouped_refs = _.groupBy(usage_refs, 'platform')
    for (let platform in grouped_refs) {
=======
    const usage_refs = (await knex('dw.fc_usage_month').distinct('ref','platform'))
    const grouped_refs = _.groupBy(usage_refs, 'platform')
    for(let platform in grouped_refs){
>>>>>>> 9b20e8971afa6f4a8fa5fe628eaa6f4deeb863d5
      await ReferralCode.add_missing(grouped_refs[platform].map(i => i.ref), platform)
    }
  }

  async importExceptions () {
    const exceptionsSQL = 'INSERT INTO dw.fc_usage_month ( ymd, platform, version, channel, ref, total ) SELECT ymd, platform, version, channel, ref, total from dw.fc_usage_month_exceptions ON CONFLICT (ymd, platform, version, channel , ref) DO UPDATE SET total = EXCLUDED.total'
    await knex.raw(exceptionsSQL)
  }
}
