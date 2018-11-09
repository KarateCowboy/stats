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
        wallets: this.wallets,
        balance: this.balance,
        funded: this.funded,
      })
    }

    async destroy () {
      await knex('dw.fc_usage').delete({
        id: this.id
      })
    }
  }

  factory.define('wallet', Wallet, {
    created: () => { return moment().subtract(Util.random_int(90), 'days').format('YYYY-MM-DD')},
    wallets: () => { return Util.random_int(200)},
    balance: () => { return Util.random_int(100000) * 1.137 },
    funded: () => { return Util.random_int(100) }
  })
}

module.exports.define = define
