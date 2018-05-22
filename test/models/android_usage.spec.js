const AndroidUsage = require('../../src/models/android_usage').AndroidUsage
const moment = require('moment')
const TestHelper = require('../test_helper').TestHelper

let test_helper
before(async function () {
  test_helper = new TestHelper()
  await test_helper.setup()
})
after(async function () {
  await test_helper.tear_down()
})
beforeEach(async function () {
  await test_helper.truncate()
  await test_helper.refresh_views()
})

describe('AndroidUsage', async function () {
  describe('#is_valid', async function () {
    it('returns true for a valid android_usage', async function () {
      const android_usage = await factory.attrs('android_usage')
      expect(AndroidUsage.is_valid(android_usage)).to.equal(true)
    })
    it('requires a correctly formatted year_month_day', async function () {
      const android_usage = await factory.attrs('android_usage', { year_month_day: '2018-1-1'})
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('requires monthly, daily, weekly', async function () {
      const android_usage = await factory.attrs('android_usage', { daily: null})
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
      android_usage.daily = true
      android_usage.monthly = null
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
      android_usage.monthly = true
      android_usage.weekly = null
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('requires the platform to be "androidbrowser"', async function () {
      const android_usage = await factory.attrs('android_usage', { platform: 'ios'})
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('requires a correctly formatted version', async function () {
      const android_usage = await factory.attrs('android_usage', { version: '1.2'})
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('requires the "first" boolean', async function () {
      const android_usage = await factory.attrs('android_usage', { first: null })
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('requires a valid channel', async function () {
      const android_usage = await factory.attrs('android_usage', { channel: 'cars' })
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('requires a valid woi', async function(){
      const android_usage = await factory.attrs('android_usage', { woi: '2018-1-1' })
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
    it('has the ref as optional', async function(){
      const android_usage = await factory.attrs('android_usage', { ref: null })
      expect(AndroidUsage.is_valid(android_usage)).to.equal(true)
    })
    it('requires a ts', async function(){
      const android_usage = await factory.attrs('android_usage', { ts: null })
      expect(AndroidUsage.is_valid(android_usage)).to.equal(false)
    })
  })
})
