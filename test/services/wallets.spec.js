require('../test_helper')
const _ = require('underscore')
const moment = require('moment')
let WalletService = require('../../src/services/wallets.service')
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
      this.timeout(10000)
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
    it('updates data for previously existing wallet dates', async function () {
      const original_api_wallet = await factory.attrs('wallet_from_api')
      const second_api_wallet = await factory.attrs('wallet_from_api')

      sinon.stub(common, 'prequest').returns(JSON.stringify([original_api_wallet]))
      service = new WalletService()
      await service.updateFromLedger()
      common.prequest.restore()

      sinon.stub(common, 'prequest').returns(JSON.stringify([second_api_wallet]))
      await service.updateFromLedger()
      common.prequest.restore()
      const walletsFromDb = await db.Wallet.findAll()
      expect(walletsFromDb).to.have.property('length', 1)

    })
    it('handles the JSON parse error', async function () {
      const apiResults = require('../fixtures/ledger_wallets')
      sinon.stub(common, 'prequest').returns(JSON.stringify(apiResults))
      service = new WalletService()
      sinon.stub(service, 'getFromLedger').throws(new Error('Unexpected token < in JSON at position 0'))
      await service.updateFromLedger()
      common.prequest.restore()
    })
    afterEach(async function () {
      if (common.prequest.restore) {
        common.prequest.restore()
      }
    })
  })
  describe('getFromLedger', async function () {
    it('throws an error when it receives a 406 result', async function () {
      const apiResults = {
        statusCode: 406,
        error: 'Not Acceptable',
        message: 'Not Acceptable'
      }
      sinon.stub(common, 'prequest').returns(JSON.stringify(apiResults))
      service = new WalletService()
      let thrown = false
      try {
        await service.getFromLedger()
      } catch (e) {
        thrown = true
        expect(e.message).to.equal('Error: could not access ledger server. 406 response received')
      }
      expect(thrown).to.equal(true)
      common.prequest.restore()
    })
    it('throws other response errors, rather than swallowing them', async function () {
      const apiResults = {
        statusCode: 101,
        error: 'Not Acceptable',
        message: 'Not Acceptable'
      }
      sinon.stub(common, 'prequest').returns(JSON.stringify(apiResults))
      service = new WalletService()
      let thrown = false
      try {
        await service.getFromLedger()
      } catch (e) {
        thrown = true
        expect(e.message).to.not.equal('Error: could not access ledger server. 406 response received')
      }
      expect(thrown).to.equal(true)
      common.prequest.restore()
    })
    it('uses the fixie proxy when LOCAL is false', async function () {
      delete process.env.LOCAL
      sinon.stub(common, 'prequest').callsFake((args) => {
        if (args.agent) {
          return '["proxy"]'
        } else {
          return '["noproxy"]'
        }
      })
      service = new WalletService()
      const response = await service.getFromLedger()
      common.prequest.restore()
      process.env.LOCAL = 'true'
      expect(response).to.include('proxy')
    })

    it('does not use the fixie proxy when LOCAL is true', async function () {
      sinon.stub(common, 'prequest').callsFake((args) => {
        if (args.agent) {
          return '["proxy"]'
        } else {
          return '["noproxy"]'
        }
      })
      service = new WalletService()
      //execution
      const response = await service.getFromLedger()
      //validation
      expect(response).to.include('noproxy')
      common.prequest.restore()
    })
  })
})
