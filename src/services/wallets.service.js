const _ = require('underscore')
const common = require('../api/common')
const moment = require('moment')
const ProxyAgent = require('proxy-agent')

module.exports = class WalletsService {
  async updateFromLedger (daysBack = undefined) {
    try {
      const results = await this.getFromLedger(daysBack)
      const created_dates = results.map(r => r.created)
      await knex('dw.fc_wallets').whereIn('created', created_dates).delete()
      for (const r of results) {
        let wallet
        try {
          wallet = new db.Wallet({
            created: r.created,
            wallets: r.wallets,
            balance: db.Wallet.probiToBalance(r.walletProviderBalance),
            funded: r.walletProviderFunded
          })
          await wallet.save()
        } catch (e) {
          console.log('Error inserting wallet data from ledger:')
          console.log(`   ${e.message}`)
          console.dir(e.errors)
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

  async getFromLedger (daysBack) {
    const start = moment().subtract(daysBack || 3, 'days').format('YYYY-MM-DD')
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')
    const options = {
      method: 'GET',
      uri: `${process.env.LEDGER_HOST}/v2/wallet/stats/${start}/${tomorrow}`,
      headers: {
        Authorization: 'Bearer ' + process.env.LEDGER_TOKEN
      }
    }
    if (process.env.hasOwnProperty('LOCAL') === false) {
      options.agent = new ProxyAgent(process.env.FIXIE_URL)
    }
    let result = await common.prequest(options)
    try {
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
