require('../test_helper')
const sinon = require('sinon')
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
        await service.expire({id: crashAttrs.id})
        //validation
        const allCrashes = await knex('dtl.crashes').select()
        expect(allCrashes).to.have.property('length', 0)
      })
    })
    context('S3 Crash Bucket', async function () {
      it('deletes the crash by id', async function () {
        //setup
        const crashAttrs = await factory.attrs('crash')
        const bucketParams = {
          Bucket: process.env.S3_CRASH_BUCKET,
          Key: crashAttrs.id
        }
        sinon.stub(service.S3, 'deleteObject').withArgs(bucketParams)
        await service.expire({id: crashAttrs.id})
        expect(service.S3.deleteObject.calledWith(bucketParams)).to.equal(true)
      })
    })
    context('ElasticSearch', async function () {
      it('removes the crash from the search index', async function () {
        const crashAttrs = await factory.attrs('crash')
        const indexArgs = {index: 'crashes', id: crashAttrs.id, type: 'crash'}
        sinon.stub(service.elasticClient, 'delete').withArgs(indexArgs)
        await service.expire({id: crashAttrs.id})
        expect(service.elasticClient.delete.calledWith(indexArgs)).to.equal(true, 'elasticClient.delete method should have been called with the expected args')
      })
    })
  })
})
