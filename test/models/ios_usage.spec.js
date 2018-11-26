const IosUsage = require('../../src/models/ios-usage.model')()
const moment = require('moment')
require('../test_helper')

describe('IosUsage', async function () {
  describe('schema', async function () {
    specify(' year_month_day: {type: String},', async function () {
      const ios_usage = new IosUsage()
      expect(ios_usage).to.have.property('year_month_day', moment().format('YYYY-MM-DD'))
    })
    specify('  woi: {type: String},', async function () {
      const ios_usage = new IosUsage()
      expect(ios_usage).to.have.property('woi', moment().startOf('week').add(1, 'days').format('YYYY-MM-DD'))
    })
    specify(' ref: {type: String},', async function () {
      const ios_usage = new IosUsage()
      expect(ios_usage).to.have.property('ref', 'none')
    })
    specify(' platform: {type: String},', async function () {
      let thrown = false
      try {
        const ios_usage = new IosUsage()
      } catch (e) {
        thrown = true
        expect(e.message).to.contain()
      }
    })
    specify(' version: {type: String}, ', async function () {})
    specify(' channel: {type: String}, ', async function () {})
    specify(' daily: Boolean,', async function () {})
    specify(' weekly: Boolean, ', async function () {})
    specify(' monthly: Boolean, ', async function () {})
    specify(' first: Boolean, ', async function () {})
    specify(' ts: {type: Number}, ', async function () {})
    specify(' aggregated_at: {type: Date},', async function () {})
  })
  describe('class methods', async function () {
    describe('monthly_active_users', async function () {
      it('takes a moment and returns the count', async function () {
        const ymd = moment().startOf('month').add(3, 'days')
        const monthly_usages = await factory.buildMany('ios_usage', 321, {
          monthly: true,
          year_month_day: ymd.format('YYYY-MM-DD')
        })
        await Promise.all(monthly_usages.map(async (u) => { await u.save()}))
        const not_monthly = await factory.buildMany('ios_usage', 642, {
          monthly: false,
          year_month_day: ymd.format('YYYY-MM-DD')
        })
        await Promise.all(not_monthly.map(async (u) => { await u.save()}))
        const monthly_usage_count = await IosUsage.monthly_active_users(ymd)
        expect(monthly_usage_count).to.equal(monthly_usages.length)
      })
    })
  })
})
