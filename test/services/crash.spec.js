/* global factory, knex, describe, expect, it, beforeEach, context */

require('../test_helper')

const sinon = require('sinon')
const _ = require('lodash')
const CrashExpirationService = require('../../src/services/crash.service')
describe('CrashExpirationService', async function () {
  describe('expire', async function () {
    let service
    beforeEach(async function () {
      service = new CrashExpirationService()
    })
    context('dtl.crashes table', async function () {
      it('deletes the crash by id', async function () {
        // setup
        const crashAttrs = await factory.attrs('crash')
        await knex('dtl.crashes').insert(crashAttrs)
        sinon.stub(service.S3, 'deleteObject').returns({ promise: () => {} })
        sinon.stub(service.elasticClient, 'delete').resolves(true)
        // execution
        await service.expire({ id: crashAttrs.id })
        // validation
        const allCrashes = await knex('dtl.crashes').select()
        expect(allCrashes).to.have.property('length', 0)
      })
    })
    context('S3 Crash Bucket', async function () {
      it('deletes the crash by id', async function () {
        // setup
        const crashAttrs = await factory.attrs('crash')
        const bucketParams = {
          Bucket: process.env.S3_CRASH_BUCKET,
          Key: crashAttrs.id
        }
        sinon.stub(service.elasticClient, 'delete')
        sinon.stub(service.S3, 'deleteObject').withArgs(bucketParams).returns({ promise: () => {} })
        await service.expire({ id: crashAttrs.id })
        expect(service.S3.deleteObject.calledWith(bucketParams)).to.equal(true)
      })
      it('deletes the text parsed item', async function () {
        // setup
        const crashAttrs = await factory.attrs('crash')
        const crashParams = {
          Bucket: process.env.S3_CRASH_BUCKET,
          Key: crashAttrs.id
        }
        const symbolizedParams = {
          Bucket: process.env.S3_CRASH_BUCKET,
          Key: crashAttrs.id + '.symbolized.txt'
        }
        sinon.stub(service.elasticClient, 'delete').resolves(true)
        const stub = sinon.stub(service.S3, 'deleteObject')
        stub.withArgs(crashParams).returns({ promise: _.noop })
        stub.withArgs(symbolizedParams).returns({ promise: _.noop })
        // execution
        await service.expire({ id: crashAttrs.id })
        // validation
        expect(service.S3.deleteObject.calledWith(symbolizedParams)).to.equal(true, 'expiration function should try to delete any `symbolized.txt` item associated with the crash')
      })
    })
    context('ElasticSearch', async function () {
      it('removes the crash from the search index', async function () {
        const crashAttrs = await factory.attrs('crash')
        const indexArgs = { index: 'crashes', id: crashAttrs.id, type: 'crash' }
        sinon.stub(service.S3, 'deleteObject').returns({ promise: () => {} })
        sinon.stub(service.elasticClient, 'delete').withArgs(indexArgs)
        await service.expire({ id: crashAttrs.id })
        expect(service.elasticClient.delete.calledWith(indexArgs)).to.equal(true, 'elasticClient.delete method should have been called with the expected args')
      })
    })
  })
})
