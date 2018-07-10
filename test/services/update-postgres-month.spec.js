const moment = require('moment')
const TestHelper = require('../test_helper').TestHelper
const MonthUpdate = require('../../src/services/update-postgres-month.service')
const _ = require('underscore')
let test_helper

// before.skip(async function () {
//   test_helper = new TestHelper()
//   await test_helper.setup()
// })
// after.skip(async function () {
//   await test_helper.tear_down()
// })
// beforeEach.skip(async function () {
//   await test_helper.truncate()
//   await test_helper.refresh_views()
// })

describe('update-postres-month', async function () {
  describe('exec', async function () {
    it.skip('works on the brave core usages', async function () {
      // setup
      const service = new MonthUpdate()
      const core_usage = await factory.build('core_winx64_usage')
      await core_usage.save()
      await service.main('brave_core_usage', moment().subtract(3, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
      const usage_months = await knex('dw.fc_usage_month').select('*')
      expect(usage_months).to.have.property('length', 1)
      expect(usage_months[0]).to.have.property('platform', 'winx64-bc')
      expect(usage_months[0]).to.have.property('ymd', core_usage.year_month_day)
    })
  })
})
