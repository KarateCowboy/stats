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
  await browser.select_by_value_when_visible('#daysSelector', '120')
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

Then(/^I should see the Daily New Users chart$/, async function(){
  expect((await browser.isExisting('#usageChart'))).to.equal(true, 'usageChart should be visible')
})

Given(/^there are new user records for the last three weeks$/, async function () {
  const data = _.range(1, 21).map((i) => { return {ymd: (moment().subtract(i, 'days').format('YYYY-MM-DD'))}})
  await factory.createMany('fc_usage', data)
})
