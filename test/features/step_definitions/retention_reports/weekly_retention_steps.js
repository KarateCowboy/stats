/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const _ = require('underscore')
const moment = require('moment')
const {ReferralCode} = require('../../../../src/models/mongoose/referral_code')

Given(/^I am logged in to the system$/, {timeout: 7000}, async function () {
  await browser.url('http://localhost:8193')
  await browser.waitForVisible('#inputEmail', 3000)
  await browser.setValue('#inputEmail', 'admin')
  await browser.setValue('#inputPassword', this.adminPassword)
  await browser.click('.btn-primary')
})

Given(/^I click the menu item for weekly retention$/, async function () {
  expect(await browser.getUrl()).to.include('dashboard')
  await browser.click_when_visible('#weeklyRetention')
})

Then(/^I should see the report page for weekly retention$/, async function () {
  await browser.waitForVisible('#weeklyRetentionTableContainer', 2000)
  const table_html = await browser.getHTML('#weeklyRetentionTableContainer')
  expect(table_html).to.include('Weeks since installation')

  const body_html = await browser.getHTML('body')
  expect(body_html).to.include('Weekly Retention')
})

Given(/^I view the recent weekly retention data$/, async function () {
  for (let i in _.range(12)) {
    const total = i * 100
    let ret_woi = await factory.build('fc_retention_woi', {
      total: total,
      ymd: (moment().subtract(i, 'weeks').startOf('week').add(3, 'days').format('YYYY-MM-DD')),
      ref: 'none'
    })
    await ret_woi.save()
    ret_woi = await factory.build('fc_retention_woi', {
      total: total,
      ymd: (moment().subtract(i, 'weeks').startOf('week').add(3, 'days').format('YYYY-MM-DD')),
      ref: 'ABC123'
    })
    await ret_woi.save()
  }
  const referral = new ReferralCode({code_text: 'ABC123', platform: 'winx64'})
  await referral.save()
  await browser.url('http://localhost:8193/dashboard#weekly-retention')
})

Then(/^I should be able to filter by referral code$/, async function () {
  const sample_ref = await ReferralCode.findOne()
  await browser.setValue('#ref input', sample_ref.code_text)
})

Given(/there is a complete retention run in the retention table/, async function () {
  //create retention data for each platform
  const platforms = ['ios', 'androidbrowser', 'linux', 'winia32', 'winx64', 'osx', 'linux-bc', 'osx-bc', 'winx64-bc']
  const today = moment()
  for (let platform of platforms) {
    const rets = await factory.createMany('fc_retention_woi', _.range(1, 91).map((i) => {
      return {
        platform: platform,
        ymd: today.clone().subtract(i, 'days').format('YYYY-MM-DD')
      }
    }))
    await Promise.all(rets.map(async (r) => { await r.save() }))
  }
})

Given(/"([^"]*)" retention data is missing$/, async function (platform) {
  await knex('dw.fc_retention_woi').where('platform', platform).delete()
})

Then(/^I should see a warning about the missing "([^"]*)" platform data$/, async function (platform) {
  await browser.pause(500)
  const page_html = await browser.getHTML('body')
  expect(page_html).to.include(`Missing ${platform} data`)
})
