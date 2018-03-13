const TestHelper = require('../test_helper').TestHelper
const AndroidUsageAggregateWeek = require('../../src/models/android_usage_aggregate_week')

let test_helper
before(async function(){
  test_helper = new TestHelper()
  await test_helper.setup()
})
after(async function(){
  await test_helper.tear_down()
})
describe('AndroidUsageRecord', function () {
  describe('#scrub', function(){
    it('changes the platform from "android" to "androidbrowser"', async function(){
      //setup
      const bad_platform = await factory.build('android_usage_aggregate_week')
      //execution
      const scrubbed_record = AndroidUsageAggregateWeek.scrub(bad_platform)
      //validation
      expect(scrubbed_record._id.platform).to.equal('androidbrowser')
    })
  })
})