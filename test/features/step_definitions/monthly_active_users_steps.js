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
const UpdatePostgresDayService = require('../../../src/services/update-postgres-day.service')
const CoreUsage = require('../../../src/models/core-usage.model')()

Given(/^there are "([^"]*)" usages for the prior month$/, {timeout: 100000}, async function (number_of_usages) {
  await build_monthly_usages(number_of_usages)
})

Given(/^there are "([^"]*)" mixed ref usages for the prior month$/, {timeout: 100000}, async function (number_of_usages) {
  await build_monthly_usages(number_of_usages, true)
})

build_monthly_usages = async (number_of_usages, mixed_ref = false) => {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  const working_date = moment().startOf('month').subtract(2, 'weeks').startOf('month')
  const usages = []
  for (let i of _.range(1, 29)) {
    working_date.add(1, 'days')
    let refs = []
    if (!mixed_ref) {
      refs.push('none')
    } else {
      refs = await Promise.all(_.range(1, 8).map(async (i) => { return (await factory.attrs('core_winx64_usage')).ref}))
    }
    for (let ref of refs) {
      for (let j of _.range(1, (per_day + 1) / refs.length)) {
        const build_args = {
          year_month_day: working_date.format('YYYY-MM-DD'),
          woi: working_date.clone().subtract(7, 'days').format('YYYY-MM-DD'),
          ts: () => { return working_date.clone().toDate().getTime()},
          ref: ref,
          channel: 'release'
        }
        let usage = await factory.attrs('core_winx64_usage', build_args)
        usages.push(usage)
      }
    }
  }
  await mongo_client.collection('brave_core_usage').insertMany(usages.slice(0, number_of_usages))
  const month_service = new MonthUpdate()
  await month_service.main('brave_core_usage', moment().subtract(5, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
  const day_service = new UpdatePostgresDayService()
  await day_service.main('brave_core_usage', 172)
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_usage_platform_mv')
}

Then(/^I should see the "([^"]*)" MAU for the prior month on winx64\-bc$/, async function (number_of_users) {
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(number_of_users)
})

Given(/^there is complete monthly usage data in the tables$/, async function () {
  const platforms = ['ios', 'androidbrowser', 'linux', 'winia32', 'winx64', 'osx', 'linux-bc', 'osx-bc', 'winx64-bc']
  const today = moment()
  for (let platform of platforms) {
    const usages = await factory.createMany('fc_usage_month', _.range(1, 91).map((i) => {
      return {
        platform: platform,
        ymd: today.clone().subtract(i, 'days').format('YYYY-MM-DD')
      }
    }))
    await Promise.all(usages.map(async (u) => { await u.save() }))
  }
})

Given(/^"([^"]*)" mau data is missing$/, async function (platform) {
  await knex('dw.fc_usage_month').where('platform', platform).delete()
})
Given(/^I enter an existing referral code in the text box$/, async function () {
  const sample = await CoreUsage.findOne() //mongo_client.collection('brave_core_usage').findOne({})
  await browser.select_by_value_when_visible('#daysSelector', '120')
  this.setTo('sample', sample)
  await browser.click('button.close')
  await browser.click('#ref-filter')
  await browser.keys(sample.ref)
  await browser.keys('\uE007')
  await  browser.pause(500)
})

Then(/^the report should limit to the existing referrals statistics$/, async function () {
  const total = await mongo_client.collection('brave_core_usage').count({
    ref: this.sample.ref
  })
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
})

Then(/^the report should show only the average dau for that referral code$/, async function () {
  const count_for_day = await CoreUsage.count({year_month_day: this.sample.year_month_day, ref: this.sample.ref})
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(count_for_day / 30)
})
