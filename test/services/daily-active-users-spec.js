const moment = require('moment')
require('../test_helper')
const DailyActiveUsers = require('../../src/services/daily-active-users.service')
const _ = require('underscore')
const FS = require('fs-extra')

let service
describe('DailyActiveUsers Service', async function () {
  beforeEach(async function () {
    service = new DailyActiveUsers()
  })
  describe('#platform_minus_first', async function () {
    it.skip('takes days, platforms, channels, ref as args', async function () {
      const results = await service.platform_minus_first(days, platforms, channels, ref)
    })
    it('returns items with ymd, platform, all_count, first_count, count', async function () {
      this.timeout(100000)
      await test_helper.truncate()
      const days_ago = moment().subtract(5, 'days')
      const original_woi = days_ago.format('YYYY-MM-DD')
      const usages_to_insert = []
      for (let i of _.range(1, 31)) {
        let first_time_usage = await factory.attrs('core_winx64_usage', {
          year_month_day: original_woi,
          ref: 'none',
          first: true,
          woi: original_woi
        })
        usages_to_insert.push(first_time_usage)
      }
      days_ago.add(3, 'days')
      for (let j of _.range(1, 21)) {
        let returning_usage = await factory.attrs('core_winx64_usage', {
          year_month_day: days_ago.format('YYYY-MM-DD'),
          ref: 'none',
          first: false,
          woi: original_woi
        })
        usages_to_insert.push(returning_usage)
      }
      await mongo_client.collection('brave_core_usage').insertMany(usages_to_insert)
      const UpdatePostgresDay = require('../../src/services/update-postgres-day.service')
      const dau_service = new UpdatePostgresDay()
      await dau_service.main('brave_core_usage')

      let days = 7
      let platforms = ['winx64-bc', 'osx']
      let channels = ['dev', 'stable', 'release']
      const results = await service.platform_minus_first(days, platforms, channels)
      const fc_usages = await knex('dw.fc_usage').select('*')
      console.dir(fc_usages)
      expect(results).to.have.property('length', 1)
      console.log(`length is ${results.length}`)

      expect(results[0]).to.have.property('ymd')
      expect(results[0]).to.have.property('platform')
      expect(results[0]).to.have.property('all_count')
      expect(results[0]).to.have.property('first_count')
      expect(results[0]).to.have.property('count')
    })
  })
})
