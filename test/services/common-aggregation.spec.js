require('../test_helper')
const CommonAggregationService = require('../../src/services/common-aggregation.service')
const util = require('util')
const _ = require('lodash')
const moment = require('moment')
describe('CommonAggregation', async function () {
  describe('deleteRecordsForYMD', async function () {
    it('deletes records matching the YMD from the given table')
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
      let coreUsages, twoMonthsAgo, summary, service, attrs
      beforeEach(async function () {
        twoMonthsAgo = moment().subtract(2, 'months')
        const attrs = _.range(0, 100).map((i) => {
          return {
            year_month_day: moment().subtract(i, 'days').format('YYYY-MM-DD')
          }
        })
        coreUsages = await factory.createMany('core_winx64_usage', attrs)
        service = new CommonAggregationService()
        summary = await service.summarize(twoMonthsAgo.format('YYYY-MM-DD'), 'daily', 'brave_core_usage')
      })
      specify('ymd', async function () {
        const sample = _.first(summary)
        expect(sample.ymd).to.equal(twoMonthsAgo.format('YYYY-MM-DD'))
      })
      specify('platform', async function () {
        const sample = _.first(summary)
        expect(sample.platform).to.equal(coreUsages[0].platform)
      })
      specify('version', async function () {
        const aggVersions = _.uniq(summary.map((i) => { return i.version })).sort()
        expect(aggVersions).to.have.members(_.uniq(coreUsages.map(i => i.version)).sort())
      })
      specify('first_time', async function () {
        expect(_.every(summary, 'first_time')).to.equal(true)
      })
      specify('channel', async function () {
        expect(_.every(summary, (i) => { return _.isString(i.channel)})).to.equal(true)
      })
      specify('ref', async function () {
        expect(_.every(summary, (i) => { return _.isString(i.ref)})).to.equal(true)
      })
      specify('woi', async function () {
        const aggWois = _.uniq(summary.map(i => i.woi)).sort()
        expect(_.uniq(coreUsages.map(i => i.woi)).sort()).to.have.members(aggWois)
      })
      specify('doi', async function () {
        const aggDois = _.uniq(summary.map(i => i.doi)).sort()
        const coreDois = _.uniq(coreUsages.map(i => i.doi)).sort()
        expect(coreDois).to.have.members(aggDois)
      })
      specify('country_code', async function () {
        const aggCountries = _.uniq(summary.map(i => i.country_code)).sort()
        const coreUsageCountries = coreUsages.map(i => i.country_code)
        expect(coreUsageCountries).to.contain(aggCountries[0])
      })
      specify('count', async function () {
        for (let s of summary) {
          expect(s.count).to.be.a('number')
        }
      })
    })
    context('daily', async function () {
      let oneMonthAgo, startOfMonth
      beforeEach(async function () {
        oneMonthAgo = moment().subtract(1, 'month')
        startOfMonth = oneMonthAgo.clone().startOf('month')
        const day = startOfMonth.clone()
        await Promise.all(_.range(0, 3).map(async (i) => {
          const numOfUsages = _.random(10, 500)
            await factory.createMany('core_winx64_usage', numOfUsages, {
                year_month_day: day.add(i, 'days').format('YYYY-MM-DD'),
                ref: `ABC12${_.random(0,3)}`
            })
        }))
      })
      it('accurately counts usages for the day', async function () {
        const commonAggregator = new CommonAggregationService()
        const summarized = await commonAggregator.summarize(startOfMonth.format('YYYY-MM-DD'), 'daily', 'brave_core_usage' )
        await Promise.all(summarized.map(async (s) => {
            const dbCount = await mongo_client.collection('brave_core_usage').count({
                ref: s.ref,
                country_code: s.country_code,
                doi: s.doi,
                woi: s.woi,
                first: s.first_time,
                year_month_day: s.ymd,
                version: s.version,
                platform: s.platform
            })
            expect(s.count).to.equal(dbCount, `database count ${dbCount} did not match count for ${util.inspect(s)}`)
        }))
      })
    })
  })

})

