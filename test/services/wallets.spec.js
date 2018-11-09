const _ = require('underscore')
const moment = require('moment')
require('../test_helper')
let WalletService = require('../../src/services/wallets.service')
const {ObjectID} = require('mongodb')
const sinon = require('sinon')

let service
const common = require('../../src/api/common')

describe('Wallets service', async function () {
  describe('updateFromLedger', async function () {
    it('fails when LEDGER_HOST is not set', async function () {
      service = new WalletService()
      let thrown = false
      const ledger_host = process.env.LEDGER_HOST
      try {
        process.env.LEDGER_HOST = undefined
        await service.updateFromLedger()
      } catch (e) {
        thrown = true
        process.env.LEDGER_HOST = ledger_host
        expect(e.message).to.match(/Invalid URI/)
      }
      expect(thrown).to.equal(true)
    })
    it('can take a date cuttoff argument', async function () {
      let apiResults = require('../fixtures/ledger_wallets')
      let day_mark = 1
      let modResults = _.clone(apiResults).map((r) => {
        r.created = moment().subtract(day_mark, 'days').format('YYYY-MM-DD')
        day_mark++
        return r
      })
      sinon.stub(common, 'prequest').returns(JSON.stringify(modResults))
      service = new WalletService()
      const cutoff = 15
      const cutoff_day = moment().subtract(cutoff, 'days')
      await service.updateFromLedger(cutoff)
      const walletsFromDb = await knex('dw.fc_wallets').select()
      expect(walletsFromDb).to.have.property('length', 15)
      for (let wallet in walletsFromDb) {
        expect(moment(wallet.created).isSameOrAfter(cutoff_day)).to.equal(true)
      }

      common.prequest.restore()
    })
    it('puts a bunch of data from the ledge API in the table', async function () {
      const apiResults = require('../fixtures/ledger_wallets')
      sinon.stub(common, 'prequest').returns(JSON.stringify(apiResults))
      service = new WalletService()
      await service.updateFromLedger()
      common.prequest.restore()
      const walletsFromDb = await knex('dw.fc_wallets').select()
      expect(walletsFromDb).to.have.property('length', 307)
      const sample = _.last(walletsFromDb)
      expect(sample).to.have.property('id')
      expect(sample).to.have.property('created_at')
      expect(sample).to.have.property('updated_at')
      expect(sample).to.have.property('wallets')
      expect(sample).to.have.property('balance')
      expect(sample).to.have.property('funded')
      expect(sample).to.have.property('created')
    })
  })
})
