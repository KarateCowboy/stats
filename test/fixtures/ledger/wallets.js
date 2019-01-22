/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const _ = require('lodash')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class ApiWallet {
    async save () {
    }

    async destroy () {
    }
  }

  factory.define('wallet_from_api', ApiWallet, {
    created: () => { return moment().format('YYYY-MM-DD')},
    wallets: () => { return _.random(200)},
    contributed: () => { return _.random(1, 500)},
    walletProviderBalance: () => { return _.random(1111111111111111111111, 6666666666666666666666).toString()},
    anyFunds: () => { return _.random(10000, 30000)},
    activeGrant: () => { return _.random(1000, 9999)},
    walletProviderFunded: () => { return _.random(100, 999)}
  })
}

module.exports.define = define
