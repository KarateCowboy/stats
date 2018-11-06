/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const Util = require('../../src/models/util').Util

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class Wallet {
    async save () {
      await knex('dw.fc_wallets').insert({
        created: this.created,
        contributed: this.contributed,
        wallets: this.wallets,
        walletProviderBalance: this.walletProviderBalance,
        anyFunds: this.anyFunds,
        activeGrant: this.activeGrant,
        walletProviderFunded: this.walletProviderFunded,
        id: this.id
      })
    }

    async destroy () {
      await knex('dw.fc_usage').delete({
        id: this.id
      })
    }
  }

  factory.define('wallet', Wallet, {
    created: () => { return moment().subtract(Util.random_int(90), 'days').format()},
    contributed: () => { return Util.random_int(20) },
    wallets: () => { return Util.random_int(200)},
    walletProviderBalance: () => { return Util.random_int(100000) * 1.137 },
    anyFunds: 1,
    activeGrant: () => { return Util.random_int(10000) },
    walletProviderFunded: () => { return Util.random_int(1000) }
  })
}

module.exports.define = define
