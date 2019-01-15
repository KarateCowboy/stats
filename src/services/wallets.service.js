const _ = require('underscore')
const common = require('../api/common')
const moment = require('moment')
const ProxyAgent = require('proxy-agent')
const Wallet = require('../models/wallet.model').define(global.sequelize)

module.exports = class WalletsService {
  async updateFromLedger (daysBack = undefined) {
    try {
      const results = await this.getFromLedger(daysBack)
      for (const r of results) {
        try {
          let wallet = new Wallet({
            created: r.created,
            wallets: r.wallets,
            balance: Wallet.probiToBalance(r.walletProviderBalance),
            funded: r.walletProviderFunded
          })
          await wallet.save()
        } catch (e) {
          console.log('Error inserting wallet data from ledger:')
          console.log(`   ${e.message}`)
          console.dir(r)
        }
      }
    } catch (e) {
      if (!e.message.includes('Unexpected token < in JSON at position 0')) {
        console.log(`Error getting ledger wallets: ${e.message}`)
        throw e
      }
    }
  }

  async getFromLedger (daysBack = undefined) {

    const options = {
      method: 'GET',
      uri: `${process.env.LEDGER_HOST}/v1/wallet/stats/${moment().subtract(2, 'days').format('YYYY-MM-DD')}/${moment().format('YYYY-MM-DD')}`,
      headers: {
        Authorization: 'Bearer ' + process.env.LEDGER_TOKEN
      }
    }
    if (process.env.hasOwnProperty('LOCAL') === false) {
      options.agent = new ProxyAgent(process.env.FIXIE_URL)
    }
    let result
    try {
      result = await common.prequest(options)
      result = JSON.parse(result)
    } catch (e) {
      console.log('Error fetching wallets data')
      console.log(e.message)
      console.dir(result)
    }
    if (_.isArray(result) === false) {
      let errorMessage = ''
      if (result.statusCode === 406) {
        errorMessage += 'Error: could not access ledger server. 406 response received'
      }
      throw Error(errorMessage, result.toString())
    }
    if (daysBack) {
      result = result.filter((r) => { return r.created >= moment().subtract(daysBack, 'days').format('YYYY-MM-DD')})
    }
    return result || []
  }
}
