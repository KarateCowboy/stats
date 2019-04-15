require('../test_helper')
const CrashExpirationService = require('../../src/services/crash.service')
describe('CrashExpirationService', async function () {
  describe('expire', async function () {
    let service
    beforeEach(async function () {
      service = new CrashExpirationService()
    })
    it('takes an id', async function () {
      const id = {id: 'abc123efg456hij789'}
      await service.expire(id)
      let thrown = false
      try {
        await service.expire({foo: 'bar'})
      } catch (e) {
        thrown = true
      }
      expect(thrown).to.equal(true)
    })
    context('dtl.crashes table', async function () {
      it('deletes the crash by id', async function () {
        //setup
        const crashAttrs = await factory.attrs('crash')
        const crash = await knex('dtl.crashes').insert(crashAttrs)
        //execution
        await service.expire({ id: crashAttrs.id })
        //validation
        const allCrashes = await knex('dtl.crashes').select()
        expect(allCrashes).to.have.property('length',0)

      })
    })
  })
})
