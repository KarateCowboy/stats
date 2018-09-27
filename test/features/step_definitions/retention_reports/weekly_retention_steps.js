/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, And, Then} = require('cucumber')
const {expect} = require('chai')
const _ = require('underscore')
const moment = require('moment')
const {ReferralCode} = require('../../../../src/models/mongoose/referral_code')
const DownloadService = require('../../../../src/services/downloads.service')

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

Given(/^there are osx downloads for the last twelve weeks$/, async function () {
  const current_week = moment().startOf('week').add(1, 'days')
  const twelve_weeks_ago = moment().subtract(12, 'weeks').startOf('week').add(1, 'days')
  let current_day = twelve_weeks_ago.clone()
  let downloads = []
  while (current_day.isBefore(current_week)) {
    let download = await factory.build('download', {timestamp: current_day.format(DownloadService.timestamp_format_string)})
    downloads.push(download)
    await download.save()
    current_day.add(1, 'days')
  }
  this.setTo('downloads', downloads)
})

Given(/^there are osx usages for the last twelve weeks$/, async function () {
  for (let i of _.range(1, 13)) {
    await retention_week_spread(i)
  }
  await test_helper.refresh_views()
})
let retention_week_spread = async (weeks_ago) => {
  const current_week = moment().startOf('week').add(1, 'days')
  const start_weeks_ago = moment().subtract(weeks_ago, 'weeks').startOf('week').add(1, 'days')
  let current_day = start_weeks_ago.clone()
  let retentions = []
  while (current_day.isBefore(current_week)) {
    let retention = await factory.build('fc_retention_woi', {
      woi: start_weeks_ago.format('YYYY-MM-DD'),
      ymd: current_day.format('YYYY-MM-DD'),
      platform: 'osx'
    })
    retentions.push(retention)
    await retention.save()
    current_day.add(7, 'days')
  }
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_week_mv')
}

Then(/^I should see a column indicating downloads for each week$/, async function () {
  const download_cells = await browser.get_html_when_visible('.download-count')
  let downloads = await knex('dw.downloads').select('*')//count(knex.raw(woi_cmd)).select(knex.raw(woi_cmd)).groupBy(knex.raw(woi_cmd)).orderBy(knex.raw(woi_cmd))
  downloads =  _.groupBy(downloads, (d) => { return moment(d.timestamp).startOf('week').add(1, 'day').format('YYYY-MM-DD')})
  // console.dir(downloads, { colors: true })
  let i = 0
  for (let d of _.uniq(Object.keys(downloads).sort())) {
    console.log(d)
    console.log(d, downloads[d].length)
    expect(download_cells[i]).to.include(downloads[d].length.toString())
    i++
    // console.log(d, downloads[d].length)
  }
  // console.dir(downloads)

  expect(download_cells).to.have.property('length', 12)
  expect(download_cells[0]).to.include('7')
})
