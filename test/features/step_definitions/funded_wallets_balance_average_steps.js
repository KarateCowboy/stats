/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const _ = require('underscore')

Given(/^there are a bunch of wallets$/, async function () {
  for (let i in _.range(0, 91)) {
    const day = moment().subtract(i, 'days').format('YYYY-MM-DD')
    const wallet = await factory.create('wallet', { created: day})
    await wallet.save()
  }
})
