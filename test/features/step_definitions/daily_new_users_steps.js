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

Given(/^there are new user records for the last two months, across all channels$/, async function () {
  const usages = []
  const allChannels = await db.Channel.query()
  await Promise.all(_.range(1, 61).map(async (i) => {
    const day = moment().subtract(i, 'days')
    const channel = _.first(_.shuffle(allChannels)).channel
    const usageAttrs = await factory.attrs('fc_usage', {
      ymd: day.format('YYYY-MM-DD'),
      channel: channel,
      total: (_.random(200, 5000))
    })
    usages.push(usageAttrs)
  }))
  await factory.createMany('fc_usage', usages)
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
        ref: ref.code_text,
        first_time: true,
        total: () => { return _.random(1, 4000)}
      }
    })
    await factory.createMany('fc_usage', dated_attrs)
  }
})

Given(/^I filter Daily New Users by an existing campaign$/, async function () {
  await this.menuHelpers.setDaysBack(120)
  await browser.click('.selection')
  const refCodes = await this.sample_campaign.getReferralCodes()
  this.setTo('sampleRefCode', _.first(refCodes).code_text)
  this.menuHelpers.addToRefBox(this.sampleRefCode)
})

Then(/^I should see data in the Daily New Users table updated to match the campaign filter$/, async function () {
  const api_common = require('../../../src/api/common')
  const dnu_results = await db.UsageSummary.dailyNewUsers({
    ref: [this.sampleRefCode],
    platforms: api_common.allPlatforms,
    channels: api_common.allChannels,
    daysAgo: 120
  })
  await browser.pause(1000)
  const trs = await browser.getHTML(`#usageDataTable > tbody > tr`)
  for (let dnu of dnu_results.rows) {
    const tr = trs.find((t) => { return t.includes(dnu.ymd)})
    try {
      expect(tr).to.include(dnu.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
    } catch (e) {
      console.log(`Failed to match expected data to chart output.
         ymd is ${dnu.ymd}, count is ${dnu.count}
         Ref code is ${this.sampleRefCode}`)
      throw e
    }
  }
})

Then(/^I should see data in the Daily New Users table updated to match the (.*) channel$/, async function (channel) {
  await browser.pause(500)
  let tableRows = await this.tableHelpers.tableRows()
  const daysBack = await this.menuHelpers.getDaysBack()
  const dates = await db.UsageSummary.query()
    .distinct('ymd')
    .where('channel', channel)
    .andWhere('ymd', '>=', moment().subtract(daysBack, 'days').format('YYYY-MM-DD'))
  if (_.isArray(tableRows) === false) {
    tableRows = [tableRows]
  }
  expect(tableRows).to.have.property('length', dates.length)
})
