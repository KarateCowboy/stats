const IosUsageRecord = require('../../src/models/ios_usage_record')
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
describe('#woiFromYMD', function () {
  it('returns the prior monday', async function () {
    const bad_woi = await factory.build('ios_usage_record_bad_woi')
    const ymd = bad_woi.year_month_day
    const woi = IosUsageRecord.woiFromYMD(ymd)
    const correctResult = moment(ymd).startOf('week').add(1, 'days').format('YYYY-MM-DD')
    expect(correctResult).to.equal(woi)
  })
})
describe('#scrub', function () {
  it('fixes a bad woi based off the year_month_day', async function () {
    const bad_woi = await factory.build('ios_usage_record_bad_woi')
    const ymd = bad_woi.year_month_day
    const correctResult = moment(ymd).startOf('week').add(1, 'days').format('YYYY-MM-DD')
    const result = IosUsageRecord.scrub(bad_woi)
    expect(result.woi).to.equal(correctResult)
  })
  it('fixes a bad version', async function () {
    const bad_version = await factory.build('ios_usage_aggregate_woi', {version: '1.2 ', woi: 'ABC'})
    const result = IosUsageRecord.scrub(bad_version)
    expect(result.version).to.equal('1.2.0')
  })
})
