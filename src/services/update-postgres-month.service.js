const retriever = require('../retriever')
const model = require('../model')

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
      return result._id.version.match(new RegExp('^\\d+\\.\\d+\\.\\d+$')) && ['dev', 'stable', 'beta'].includes(result._id.channel)
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
    await Promise.all(results.map(async (row) => {
      try {
        await upsertMaker(pg_client, row)
      } catch (e) {
        console.log(e.message)
        if (!e.message.includes('invalid byte sequence')) {
          throw new Error(e)
        }
      }
    }))
  }
}
