const AndroidUsage = require('../../src/models/android-usage.model')()
const moment = require('moment')
const Util = require('../../src/models/util').Util
require('../test_helper')

describe('AndroidUsage', async function () {
  describe('schema', async function () {
    specify(' year_month_day: {type: String},', async function () {
      const android_usage = new AndroidUsage()
      expect(android_usage).to.have.property('year_month_day', moment().format('YYYY-MM-DD'))
    })
    specify('  woi: {type: String},', async function () {
      const android_usage = new AndroidUsage()
      expect(android_usage).to.have.property('woi', moment().startOf('week').add(1, 'days').format('YYYY-MM-DD'))
    })
    specify(' ref: {type: String},', async function () {
      const android_usage = new AndroidUsage()
      expect(android_usage).to.have.property('ref', 'none')
    })
    specify(' platform: {type: String},', async function () {
      let thrown = false
      try {
        const android_usage = new AndroidUsage()
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
        const monthly_usages = await factory.buildMany('android_usage', 321, {
          monthly: true,
          year_month_day: ymd.format('YYYY-MM-DD')
        })
        await Promise.all(monthly_usages.map(async (u) => { await u.save()}))
        const not_monthly = await factory.buildMany('android_usage', 642, {
          monthly: false,
          year_month_day: ymd.format('YYYY-MM-DD')
        })
        await Promise.all(not_monthly.map(async (u) => { await u.save()}))
        const monthly_usage_count = await AndroidUsage.monthly_active_users(ymd)
        expect(monthly_usage_count).to.equal(monthly_usages.length)
      })
      it('accepts optional arguments as a hash', async function () {
        const ymd = moment().startOf('month').add(3, 'days')
        const monthly_usages = await factory.buildMany('android_usage', 321, {
          monthly: true,
          year_month_day: ymd.format('YYYY-MM-DD'),
        })
        await Promise.all(monthly_usages.map(async (u) => { await u.save()}))
        const monthly_with_ref = await factory.buildMany('android_usage', 642, {
          monthly: true,
          year_month_day: ymd.format('YYYY-MM-DD'),
          ref: 'ABC123'
        })
        await Promise.all(monthly_with_ref.map(async (u) => { await u.save()}))
        const monthly_usage_count = await AndroidUsage.monthly_active_users(ymd, {ref: 'ABC123'})
        expect(monthly_usage_count).to.equal(monthly_with_ref.length)
      })
    })
    describe('dau_for_month', async function () {
      this.timeout(30000)
      it('takes a moment as a parameter and returns a hash with date/count key/val', async function () {
        const end_of_month = moment().endOf('month')
        const start_of_month = moment().startOf('month')
        let working_day = start_of_month.clone()
        let usages = []
        while (working_day.isSameOrBefore(end_of_month)) {
          const num = Util.random_int(300)
          usages = await factory.createMany('android_usage', num, {
            daily: true,
            year_month_day: working_day.format('YYYY-MM-DD')
          })
          working_day.add(1, 'days')
          await Promise.all(usages.map(async (u) => { await u.save() }))
        }
        const dau_for_month = await AndroidUsage.dau_for_month(moment())
        for (let date of dau_for_month) {
          expect(date._id).to.match(/([0-9]{2,4}-*){3,3}/)
          const count_for_day = await AndroidUsage.count({year_month_day: date._id, daily: true})
          expect(date.count).to.equal(count_for_day)
        }
      })
      it('accepts an optional hash of extra parameters', async function () {
        const end_of_month = moment().endOf('month')
        const start_of_month = moment().startOf('month')
        let working_day = start_of_month.clone()
        let usages = []
        while (working_day.isSameOrBefore(end_of_month)) {
          const num = Util.random_int(300)
          usages = await factory.createMany('android_usage', num, {
            daily: true,
            year_month_day: working_day.format('YYYY-MM-DD')
          })
          usages = usages.concat((await factory.createMany('android_usage', num, {
            ref: 'ABC123',
            daily: true,
            year_month_day: working_day.format('YYYY-MM-DD')
          })))
          await Promise.all(usages.map(async (u) => { await u.save() }))
          working_day.add(1, 'days')
        }
        const dau_for_month = await AndroidUsage.dau_for_month(moment(), {ref: 'ABC123'})
        for (let date of dau_for_month) {
          const count_for_day = await AndroidUsage.count({ref: 'ABC123', year_month_day: date._id, daily: true})
          expect(date.count).to.equal(count_for_day)
        }
      })
    })
    describe('dnu_for_month', async function () {
      this.timeout(30000)
      it('takes a moment as a parameter and returns a hash with date/count key/val', async function () {
        const end_of_month = moment().endOf('month')
        const start_of_month = moment().startOf('month')
        let working_day = start_of_month.clone()
        let usages = []
        while (working_day.isSameOrBefore(end_of_month)) {
          const num = Util.random_int(300)
          usages = await factory.createMany('android_usage', num, {
            first: true,
            year_month_day: working_day.format('YYYY-MM-DD')
          })
          working_day.add(1, 'days')
          await Promise.all(usages.map(async (u) => { await u.save() }))
        }
        const dau_for_month = await AndroidUsage.dnu_for_month(moment())
        for (let date of dau_for_month) {
          expect(date._id).to.match(/([0-9]{2,4}-*){3,3}/)
          const count_for_day = await AndroidUsage.count({year_month_day: date._id, first: true})
          expect(date.count).to.equal(count_for_day)
        }
      })
      it('accepts an optional hash of extra parameters', async function () {
        const end_of_month = moment().endOf('month')
        const start_of_month = moment().startOf('month')
        let working_day = start_of_month.clone()
        let usages = []
        while (working_day.isSameOrBefore(end_of_month)) {
          const num = Util.random_int(300)
          usages = await factory.createMany('android_usage', num, {
            first: true,
            year_month_day: working_day.format('YYYY-MM-DD')
          })
          usages = usages.concat((await factory.createMany('android_usage', num, {
            ref: 'ABC123',
            first: false,
            year_month_day: working_day.format('YYYY-MM-DD')
          })))
          await Promise.all(usages.map(async (u) => { await u.save() }))
          working_day.add(1, 'days')
        }
        const dau_for_month = await AndroidUsage.dnu_for_month(moment(), {ref: 'ABC123'})
        for (let date of dau_for_month) {
          const count_for_day = await AndroidUsage.count({ref: 'ABC123', year_month_day: date._id, daily: true})
          expect(date.count).to.equal(count_for_day)
        }
      })
    })
  })
})
