const moment = require('moment')
require('../test_helper')
const MonthUpdate = require('../../src/services/update-postgres-month.service')
const _ = require('underscore')


describe('update-postres-month', async function () {
  describe('exec', async function () {
    it('works on the brave core usages', async function () {
      // setup
      const service = new MonthUpdate()
      const core_usage = await factory.build('core_winx64_usage')
      await core_usage.save()
      await service.main('brave_core_usage', moment().subtract(3, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
      const usage_months = await knex('dw.fc_usage_month').select('*')
      expect(usage_months).to.have.property('length', 1)
      expect(usage_months[0]).to.have.property('platform', 'winx64-bc')
      expect(moment(usage_months[0].ymd).format('YYYY-MM-DD')).to.equal(core_usage.year_month_day)
    })
  })
})
