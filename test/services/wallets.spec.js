require('../test_helper')
const _ = require('underscore')
let WalletService = require('../../src/services/wallets.service')
const {ObjectID} = require('mongodb')
const sinon = require('sinon')

let service

describe('Wallets service', async function () {
  describe('updateFromLedger', async function () {
    it('puts a bunch of data from the ledge API in the table', async function () {
      const $ = require('jquery')
      // const wallets = await factory.buildMany('wallet', 100)
      const apiResults = require('../fixtures/ledger_wallets')
      let mockLedgerApi = sinon.stub().returns(apiResults)
      $.ajax = mockLedgerApi
      service = new WalletService()
      await service.updateFromLedger()
      const walletsFromDb = await knex('dw.fc_wallets').select()
      expect(walletsFromDb).to.have.property('length', 307)
      const sample = _.last(walletsFromDb)
      expect(sample).to.have.property('id')
      expect(sample).to.have.property('created_at')
      expect(sample).to.have.property('updated_at')
    })
  })
})
