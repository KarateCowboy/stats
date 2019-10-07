require('../test_helper')
const moment = require('moment')
const _ = require('underscore')
let RetentionService = require('../../src/services/retention.service')
const {ObjectID} = require('mongodb')
const {Util} = require('../../src/models/util')

let service
const platforms = ['ios', 'androidbrowser', 'linux', 'winia32', 'winx64', 'osx', 'linux-bc', 'osx-bc', 'winx64-bc', 'android-bc']
describe('retention service', async function () {
  describe('#missing', async function () {
    beforeEach(async function () {
      this.timeout(10000)
      const today = moment()
      for (let platform of platforms) {
        const rets = await factory.createMany('fc_retention_woi', _.range(1, 91).map((i) => {
          return {
            platform: platform,
            ymd: today.clone().subtract(i, 'days').format('YYYY-MM-DD')
          }
        }))
        await Promise.all(rets.map(async (r) => { await r.save() }))
      }
      service = new RetentionService()
    })
    it('returns a hash with one key per platform', async function () {
      const res = await service.missing()
      platforms.forEach((platform) => { expect(Object.keys(res)).to.include(platform)})
    })
    it('returns an array of ymd values for missing retention data', async function () {
      for (let platform of platforms) {
        const missingDate = moment().subtract(Util.random_int(80), 'days').format('YYYY-MM-DD')
        await knex('dw.fc_retention_woi').where('platform', platform)
          .andWhere('ymd', missingDate)
          .delete()
        const res = await service.missing()
        expect(res[platform]).to.include(missingDate)
        expect(res[platform]).to.have.property('length', 1)
      }
    })
  })
})
