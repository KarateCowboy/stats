require('../test_helper')
const _ = require('underscore')
const {BigNumber} = require('bignumber.js')

let Wallet
describe('Wallet model', async function () {
  context('attributes', async function () {
    specify('created', async function () {
      const wallet = new db.Wallet()
      expect(wallet).to.have.property('created')
      expect(_.isDate(wallet.created)).to.equal(true)
    })
    specify('wallets', async function () {
      const wallet = new db.Wallet()
      expect(wallet).to.have.property('wallets')
      expect(_.isNumber(wallet.wallets)).to.equal(true)
      expect(wallet.wallets).to.equal(0)
    })
    specify('balance', async function () {
      const wallet = new db.Wallet()
      expect(wallet).to.have.property('balance', 0.0)
    })
    specify('funded', async function () {
      const wallet = new db.Wallet()
      expect(wallet).to.have.property('funded', 0)
    })
    specify('timestamps', async function () {
      let wallet = new db.Wallet()
      await wallet.save()
      wallet = await db.Wallet.findOne()
      expect(wallet).to.have.property('created_at')
      expect(_.isDate(wallet.created_at)).to.equal(true)
      expect(wallet).to.have.property('updated_at')
      expect(_.isDate(wallet.updated_at)).to.equal(true)
    })
  })
  context('class methods', async function () {
    describe('#probiToBalance', async function () {
      it('divides by 1e18', async function () {
        const sample_input = '23333002535286600395785.00'
        const big_number = new BigNumber('23333002535286600395785.00')
        const correctly_converted = big_number.dividedBy(1e+18)
        const converted = db.Wallet.probiToBalance(sample_input)
        expect(converted.toString()).to.equal(correctly_converted.toString())
      })
    })
  })
})