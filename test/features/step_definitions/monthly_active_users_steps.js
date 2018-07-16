/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const _ = require('underscore')

const MonthUpdate = require('../../../src/services/update-postgres-month.service')

Given(/^there are "([^"]*)" usages for the prior month$/, {timeout: 100000}, async function (number_of_usages) {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  const start_of_month = moment().startOf('month').subtract(2, 'weeks').startOf('month')
  const usages = []
  for (let i of _.range(1, 29)) {
    start_of_month.add(1, 'days')
    for (let j of _.range(1, per_day + 1)) {
      let usage = await factory.attrs('core_winx64_usage', {
        year_month_day: start_of_month.format('YYYY-MM-DD'),
        ref: 'none'
      })
      usages.push(usage)
    }
  }
  await mongo_client.collection('brave_core_usage').insertMany(usages.slice(0, number_of_usages))
  const month_service = new MonthUpdate()
  await month_service.main('brave_core_usage', moment().subtract(5, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
})

Then(/^I should see the "([^"]*)" MAU for the prior month on winx64\-bc$/, async function (number_of_users) {
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(number_of_users)
})
