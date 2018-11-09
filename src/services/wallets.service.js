const common = require('../api/common')
const moment = require('moment')

module.exports = class WalletsService {
  async updateFromLedger (daysBack = undefined) {
    try {
      const results = await this.getFromLedger(daysBack)
      for (const r of results) {
        try {
          await knex('dw.fc_wallets').insert({
            created: r.created,
            wallets: r.wallets,
            balance: r.walletProviderBalance,
            funded: r.walletProviderFunded
          })
        } catch (e) {
          console.log('Error inserting wallet data from ledger:')
          console.log(`   ${e.message}`)
          console.dir(r)
        }
      }
    } catch (e) {
      console.log(`Error getting ledger wallets: ${e.message}`)
      throw e
    }
  }

  async getFromLedger (daysBack = undefined) {
    const options = {
      method: 'GET',
      url: `${process.env.LEDGER_HOST}/v1/wallet/stats`,
      headers: {
        Authorization: 'Bearer ' + process.env.LEDGER_TOKEN
      }
    }
    if(!process.env.LOCAL){
      options.proxy = process.env.FIXIE_URL
    }
    let result = await common.prequest(options)
    result = JSON.parse(result)
    if (daysBack) {
      result = result.filter((r) => { return r.created >= moment().subtract(daysBack, 'days').format('YYYY-MM-DD')})
    }
    return result
  }
}
