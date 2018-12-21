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
const CoreUsage = require('../../../src/models/core-usage.model')()
let sample_codes, testing_ymd

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
        ref: 'none',
        channel: 'release'
      })
      usages.push(usage)
    }
  }
  await mongo_client.collection('brave_core_usage').insertMany(usages.slice(0, number_of_usages))
})

Given(/^the brave core daily numbers have been crunched$/, async function () {
  const dau_service = new UpdatePostgresDay()
  await dau_service.main('brave_core_usage')
})
Then(/^I should see "([^"]*)" usages spread over each day for the prior month$/, async function (number_of_usages) {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  await browser.pause(300)
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(per_day.toLocaleString('en'))
})

Then(/^I should see DAU numbers for all referral codes$/, async function () {
  const total = await mongo_client.collection('brave_core_usage').count({
    year_month_day: moment().subtract(1, 'days').format('YYYY-MM-DD')
  })
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
})

When(/^I pick two referral codes$/, async function () {
  testing_ymd = moment().startOf('month').subtract(2, 'weeks').startOf('month').add(2, 'days')
  let usages = await CoreUsage.find({year_month_day: testing_ymd.format('YYYY-MM-DD')})
  sample_codes = usages.slice(0, 2).map(u => u.ref)
  await browser.select_by_value_when_visible('#daysSelector', '120')
  await browser.click('#ref-filter')
  await browser.keys(sample_codes[0])
  await browser.keys('\uE007')
  await browser.keys(sample_codes[1])
  await browser.keys('\uE007')
})

When(/^I should see DAU numbers for those two referral codes$/, async function () {
  const total = await CoreUsage.count({'ref': {$in: this.codes}})
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
})

Then(/^I should see DNU numbers for those two referral codes$/, async function () {
  const total = await CoreUsage.count({
    'ref': {$in: sample_codes},
    year_month_day: testing_ymd.format('YYYY-MM-DD')
  })
  expect(total).to.be.greaterThan(0, 'total for testing should be greater than 0')
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
})

Then(/^I should see the DNU numbers for all referral codes$/, async function () {
  const working_date = moment().startOf('month').subtract(2, 'weeks').startOf('month').add(2, 'days')
  const total = await CoreUsage.count({year_month_day: working_date.format('YYYY-MM-DD')})
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
  expect(usageData).to.include('357')
})

