const moment = require('moment')
require('../test_helper')
const UpdatePostgresDay = require('../../src/services/update-postgres-day.service')
const _ = require('underscore')

describe('update-postgres-day', async function () {
  describe('main', async function () {
    it('works on the brave core usages', async function () {
      // setup
      this.timeout(30000)
      // await test_helper.truncate()
      // await test_helper.refresh_views()
      const service = new UpdatePostgresDay()
      const core_usage = await factory.build('core_winx64_usage', {year_month_day: moment().subtract(5, 'days').format('YYYY-MM-DD')})
      await core_usage.save()
      await service.main('brave_core_usage')
      const result = await pg_client.query('SELECT * FROM dw.fc_usage')
      const usage_days = result.rows
      expect(usage_days).to.have.property('length', 1)
      expect(usage_days[0]).to.have.property('platform', 'winx64-bc')
      expect(moment(usage_days[0].ymd).format('YYYY-MM-DD')).to.equal(core_usage.year_month_day)
    })
    it('filters out data with bad versions', async function () {
      // setup
      await test_helper.truncate()
      await test_helper.refresh_views()
      const service = new UpdatePostgresDay()
      const core_usage = await factory.build('core_winx64_usage', {
        year_month_day: moment().subtract(5, 'days').format('YYYY-MM-DD'),
        version: '1.3.2.4'
      })
      await core_usage.save()
      await service.main('brave_core_usage')
      const result = await pg_client.query('SELECT * FROM dw.fc_usage')
      const usage_days = result.rows
      expect(usage_days).to.have.property('length', 0)
    })
  })
})

