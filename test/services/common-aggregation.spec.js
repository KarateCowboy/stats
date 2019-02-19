require('../test_helper')
const CommonAggregationService = require('../../src/services/common-aggregation.service')
const _ = require('lodash')
const moment = require('moment')
describe('CommonAggregation', async function () {
  describe('deleteRecordsForYMD', async function () {
    it('deletes records matching the YMD from the given table', async function () {

    })
    it('works only with "dw.fc_usage_agg_" tables')
  })
  describe('cleanRecords', async function () {
    it('replaces invalid ref codes with "none"')
    it('replaces android platform with androidbrowser')
    it('replaces bad woi with 2018-02-10')
    it('replaces bad doi with 2018-02-10')

  })
  describe('summarize', async function () {
    context('returns an array of objects with properties', async function () {
      let coreUsages, twoMonthsAgo, summary
      beforeEach(async function () {
        twoMonthsAgo = moment().subtract(2, 'months')
        const ymds = _.range(0, 60).map((i) => { return {ymd: moment().subtract(i, 'days').format('YYYY-MM-DD')}})
        coreUsages = await factory.createMany('core_winx64_usage', ymds)
        summary = await CommonAggregationService.summarize(global.mongo_client, twoMonthsAgo.format('YYYY-MM-DD'), 'daily', 'brave_core_usage')
      })
      context('_id', async function () {
        specify('ymd', async function(){
          const sample = _.first(summary)
          expect(sample._id.ymd).to.match(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/)
        })
        specify('platform')
        specify('version')
        specify('first_time')
        specify('channel')
        specify('ref')
        specify('woi')
        specify('doi')
        specify('country_code')
      })
    })
    specify('count')

  })
  describe('main', async function () {
    it('deletes old records, summarizes, cleans, then writes summarized records')
  })
})