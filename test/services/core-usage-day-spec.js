require('../test_helper')
const moment = require('moment')
const _ = require('underscore')
let CoreUsageDayService = require('../../src/services/core-usage-day.service')
const {ObjectID} = require('mongodb')

let service
describe('core-usage-day service', async function () {
  describe('#retention_spread', async function () {
    beforeEach(async function () {
      service = new CoreUsageDayService()
      let woi = moment().startOf('week').add(1, 'days').subtract(3, 'months').startOf('week').add(1, 'days')
      let weeks = []
      let ymd = moment().subtract(3, 'months').startOf('week').add(3, 'days')
      let total_usages = 1000
      let refs = ['PACMAN', 'LUIGI', 'MARIO', 'KIRBY']
      for (let i in _.range(1, 13)) {
        for (let ref of refs) {
          const usage_day = await factory.build('core_usage_day')
          usage_day._id.ref = ref
          usage_day._id.woi = woi.format('YYYY-MM-DD')
          usage_day._id.ymd = ymd.format('YYYY-MM-DD')
          usage_day.usages = []
          for (let o in _.range(1, (total_usages / 4 + 1))) {
            usage_day.usages.push(new ObjectID())
          }
          usage_day.total = usage_day.usages.length
          await usage_day.save()
        }
        weeks.push(woi.format('YYYY-MM-DD'))
        ymd.add(7, 'days')
        // woi.add(7,'days')
        total_usages = Math.round(total_usages * 0.9)
      }
    })
    it('returns a hash with twelve items', async function () {
      const result = await service.retention_spread()
      expect(Object.keys(result)).to.have.property('length', 1)
      expect(result)
    })
    it('provides a twelve item object for the oldest woi', async function () {
      const result = await service.retention_spread()
      const keys = Object.keys(result).sort()
      const first_week = result[keys[0]]
      expect(Object.keys(first_week)).to.have.property('length', 12)
    })
    it('takes a date to start with and uses that monday', async function () {
      let select_date = moment().startOf('week').add(1, 'days').subtract(3, 'months').startOf('week').add(4, 'days')
      const result = await service.retention_spread(select_date.format('YYYY-MM-DD'))
      expect(result).to.have.property(select_date.startOf('week').add(1, 'days').format('YYYY-MM-DD'))
    })
  })
  describe('#operation_week', async function () {
    it('takes a usage day and returns the woi-operation week', async function () {
      service = new CoreUsageDayService()
      const usage_day = await factory.build('core_usage_day')
      const result = service.operation_week(usage_day)
      const correct_monday = moment(usage_day._id.ymd).startOf('week').add(1, 'days').format('YYYY-MM-DD')
      expect(result).to.equal(correct_monday)
    })
  })
})
