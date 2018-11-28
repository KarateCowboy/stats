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
  await build_monthly_usages(number_of_usages)
})

Given(/^there are "([^"]*)" mixed ref usages for the prior month$/, {timeout: 100000}, async function (number_of_usages) {
  await build_monthly_usages(number_of_usages, true)
})

build_monthly_usages = async (number_of_usages, mixed_ref = false) => {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  const start_of_month = moment().startOf('month').subtract(2, 'weeks').startOf('month')
  const usages = []
  for (let i of _.range(1, 29)) {
    start_of_month.add(1, 'days')
    let refs = []
    if (!mixed_ref) {
      refs.push('none')
    }else{
      refs = await Promise.all(_.range(1,8).map(async (i) => { return (await factory.attrs('core_winx64_usage')).ref}))
    }
    for(let ref of refs){
      for (let j of _.range(1, (per_day + 1) / refs.length)) {
        const build_args = {
          year_month_day: start_of_month.format('YYYY-MM-DD'),
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
}

Then(/^I should see the "([^"]*)" MAU for the prior month on winx64\-bc$/, async function (number_of_users) {
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(number_of_users)
})

Given(/^I enter an existing referral code in the text box$/, async function () {
  const sample = await mongo_client.collection('brave_core_usage').findOne({})
  this.setTo('sample',sample)
  await browser.click('button.close')
  await browser.click('#ref-filter')
  await browser.keys(sample.ref)
  await browser.keys("\uE007")
})

Then(/^the report should limit to the existing referrals statistics$/, async function(){
    const total = await mongo_client.collection('brave_core_usage').count({ ref: this.sample.ref })
    const usageData = await browser.getHTML('#usageContent .table-responsive')
    expect(usageData).to.include(total.toLocaleString('en'))
})
