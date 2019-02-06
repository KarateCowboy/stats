/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const _ = require('lodash')
const moment = require('moment')

Given(/^I should see the Daily New Users report$/, async function () {
  await browser.click_when_visible('#controls-selected-days')
  await browser.click('#controls-days-menu > li:nth-of-type(3)') //120 days
  await browser.click('#contentTitle') // hide drop-down / remove from focus
  await browser.pause(25)
  expect(await browser.getUrl()).to.include('#daily_new_users', 'url should indicate you are on the report page')
  const content_title = await browser.getHTML('#contentTitle')
  expect(content_title).to.include('Daily New Users')
  const subtitle = await browser.getText('#contentSubtitle')
  expect(subtitle).to.have.property('length', 0)
  expect((await browser.isVisible('#usageDataTable'))).to.equal(true, 'table should be visible')
  const table_rows = await browser.getHTML('#usageDataTable tbody tr')
  expect(_.isArray(table_rows)).to.equal(true, 'usageDataTable should have multiple rows')
  const usage_data = await knex('dw.fc_usage').select('*').where('first_time', true)
  expect(table_rows.length).to.equal(usage_data.length, 'number of rows in the table should be same as data')
})

Then(/^I should see the Daily New Users chart$/, async function () {
  expect((await browser.isExisting('#usageChart'))).to.equal(true, 'usageChart should be visible')
})

Given(/^there are new user records for the last three weeks$/, async function () {
  const data = _.range(1, 21).map((i) => { return {ymd: (moment().subtract(i, 'days').format('YYYY-MM-DD'))}})
  await factory.createMany('fc_usage', data)
})

Given(/^there are new user records for the last two months, across several campaigns$/, async function () {
  const two_months_ago = moment().subtract(2, 'months')
  this.setTo('two_months_ago', two_months_ago)
  const campaign_one = await factory.create('campaign', {created_at: two_months_ago.toDate()})
  const camp_one_refs = await factory.createMany('ref_code_pg', 1, {campaign_id: campaign_one.id})
  const campaign_two = await factory.create('campaign', {created_at: two_months_ago.toDate()})
  this.setTo('sample_campaign', campaign_two)
  const camp_two_refs = await factory.createMany('ref_code_pg', 2, {campaign_id: campaign_two.id})
  const campaign_three = await factory.create('campaign', {created_at: two_months_ago.toDate()})
  const camp_three_refs = await factory.createMany('ref_code_pg', 3, {campaign_id: campaign_three.id})
  const all_refs = _.flatten([camp_one_refs, camp_two_refs, camp_three_refs])
  for (let ref of all_refs) {
    const dated_attrs = _.range(1, 60).map((i) => {
      return {
        ymd: moment().subtract(i, 'days').format('YYYY-MM-DD'),
        ref: ref.get('code_text'),
        first_time: true,
        total: () => { return _.random(1, 4000)}
      }
    })
    await factory.createMany('fc_usage', dated_attrs)
  }
})

Given(/^I filter Daily New Users by an existing campaign$/, async function () {
  await browser.select_by_value_when_visible('#daysSelector', '120')
  await browser.click('.selection')
  const refCodes = await this.sample_campaign.getReferralCodes()
  await browser.keys(_.first(refCodes.models).get('code_text'))
  await browser.keys('\uE007')
})

Then(/^I should see data in the Daily New Users table updated to match the campaign filter$/, async function () {
  const api_common = require('../../../src/api/common')
  const referral_code = await db.ReferralCode.where('campaign_id', this.sample_campaign.id).fetch()
  const dnu_results = await db.UsageSummary.dailyNewUsers({
    ref: [referral_code.get('code_text')],
    platforms: api_common.allPlatforms,
    channels: api_common.allChannels,
    daysAgo: 60
  })
  await browser.pause(100)
  const trs = await browser.getHTML(`#usageDataTable > tbody > tr`)
  for (let dnu of dnu_results.rows) {
    const tr = trs.find((t) => { return t.includes(dnu.ymd)})
    expect(tr).to.include(dnu.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
  }
})

