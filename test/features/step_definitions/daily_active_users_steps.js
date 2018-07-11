/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const _ = require('underscore')
const UpdatePostgresDay = require('../../../src/services/update-postgres-day.service')

Given(/^I view the Daily Active Users by Platform report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage')
})

Given(/^there are "([^"]*)" usages for the prior week$/, {timeout: 100000}, async function (number_of_usages) {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  const days_ago = moment().subtract(7, 'days')
  const usages = []
  for (let i of _.range(1, 29)) {
    days_ago.add(1, 'days')
    for (let j of _.range(1, per_day + 1)) {
      let usage = await factory.attrs('core_winx64_usage', {
        year_month_day: days_ago.format('YYYY-MM-DD'),
        ref: 'none'
      })
      usages.push(usage)
    }
  }
  await mongo_client.collection('brave_core_usage').insertMany(usages.slice(0, number_of_usages))
})

Given(/^the brave core daily numbers have been crunched$/, async function () {
  const dau_service = new UpdatePostgresDay()
  await dau_service.main('brave_core_usage')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_usage_platform_mv ')
})
Then(/^I should see "([^"]*)" usages spread over each day for the prior month$/, async function (number_of_usages) {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(per_day.toLocaleString('en'))
})
