const $ = require('jquery')

module.exports = class WalletsService {
  async updateFromLedger () {
    try {
      const result = $.ajax({
        method: 'GET',
        url: `http://localhost:3001/v1/wallet/stats`
      })
      for (const r of result) {
        try {
          await knex('dw.fc_wallets').insert({
            created: r.created,
            contributed: r.contributed,
            wallets: r.wallets,
            walletProviderBalance: r.walletProviderBalance,
            anyFunds: r.anyFunds,
            activeGrant: r.activeGrant,
            walletProviderFunded: r.walletProviderFunded
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
}
