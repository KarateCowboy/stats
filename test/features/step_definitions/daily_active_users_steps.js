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
const Platform = require('../../../src/models/platform.model')()
const Util = require('../../../src/models/util').Util
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
  const codes = await knex('dw.fc_usage').where('ref', '!=', 'none').andWhere('first_time', true).andWhere('total', '>', 0).select('ref').limit(1)
  sample_codes = codes.map(c => c.ref)
  const refCodes = await this.sample_campaign.getReferralCodes()
  await browser.keys(_.first(refCodes.models).get('code_text'))
  testing_ymd = moment().startOf('month').subtract(2, 'weeks').startOf('month').add(2, 'days')
  await browser.click_when_visible('#controls-selected-days')
  await browser.click_when_visible('#controls-days-menu > li:nth-of-type(3)') //120 days
  await browser.click('#contentTitle')
  await browser.pause(25)
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
  const api_common = require('../../../src/api/common')
  const dnu_results = await db.UsageSummary.dailyNewUsers({
    ref: [sample_codes],
    platforms: api_common.allPlatforms,
    channels: api_common.allChannels,
    daysAgo: 120
  })
  await browser.pause(100)
  const trs = await browser.getHTML(`#usageDataTable > tbody > tr`)
  for (let dnu of dnu_results.rows) {
    const tr = trs.find((t) => { return t.includes(dnu.ymd)})
    expect(tr).to.include(dnu.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
  }
})

Then(/^I should see the DNU numbers for all referral codes$/, async function () {
  const working_date = moment().startOf('month').subtract(2, 'weeks').startOf('month').add(2, 'days')
  const total = await CoreUsage.count({year_month_day: working_date.format('YYYY-MM-DD')})
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
  expect(usageData).to.include(total)
})

Given(/^there are usages for all platforms and multiple versions for the last week$/, async function () {
  const platforms = await Platform.find()
  const working_day = moment()
  const dates = _.range(1, 11).map(d => { return {ymd: working_day.clone().subtract(d, 'days').format('YYYY-MM-DD')} })
  let version = 1
  for (let platform of platforms) {
    const attributes = dates.map(o => {
      o.platform = platform.name
      o.total = Util.random_int(400) + 1
      o.version = version.toString() + '.0.0'
      return o
    })
    await factory.createMany('fc_usage', attributes)
    version++
  }
})

Then(/^I should see DAU data for all the platforms, broken down by version$/, async function () {
  let versions = await knex('dw.fc_usage').whereNot('platform', 'android').distinct('version')
  versions = versions.map(u => u.version)
  const rows = await browser.getHTML('#usageDataTable  tr.active')
  const first_eleven = _.take(rows, 11)
  expect(first_eleven).to.have.property('length', 11)
  expect(_.every(versions, (v) => { return _.flatten(first_eleven).toString().includes(v.toString())})).to.equal(true, 'Every version should exist in the first eleven rows of the table')
})
