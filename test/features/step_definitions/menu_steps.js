/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {
  Given,
  When,
  Then
} = require('cucumber')
const {
  expect
} = require('chai')
const _ = require('lodash')

Then(/^the "([^"]*)" channels should be checked$/, async function (buttons) {
  buttons = buttons.split(',')
  await browser.click_when_visible('#controls-channels-dropdown')
  for (let button of buttons) {
    const result = await browser.getAttribute(`#controls-channels-menu > #${button}`, 'class')
    expect(result).to.equal('active', `button ${button} should be checked by default`)
  }
})
Then(/^the ref select should be visible and have no ref entered$/, async function () {
  const ref_filter_html = await browser.get_html_when_visible('#ref-filter')
  expect(ref_filter_html).to.not.contain('select2-selection__choice')
})
Then(/^the this month button should "([^"]*)" be visible$/, async function (visible) {
  const is_visible = await browser.isVisible('#btn-show-today')
  expect(is_visible).to.equal(!(visible === 'not'))
})
Given(/^I view the Retention Week \/ Week report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#weekly-retention')
})
Given(/^I view the Monthly Active Users by Platform report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_month')
})
Given(/^I view the Monthly Active Users report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_month_agg')
})

Given(/^I view the Daily Active Users report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_agg')
})

Given(/^I view the Daily Active Users by Version report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#versions')
})

Given(/^I view the Daily New Users by Platform report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#daily_new_platform')
})

Given(/^I view the Monthly Average Daily Active Users report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_month_average_agg')
})

Given(/^I view the Monthly Average Daily Active Users by Platform report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_month_average')
})

Given(/^I view the Monthly Average Daily New Users report$/, {
  timeout: 90000
}, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_month_average_new_agg')
})

Given(/^I view the Daily Active Returning Users by Platform report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#usage_returning')
})

Given(/^I view the Overview page$/, async function () {
  await browser.pause(20)
  await browser.url('http://localhost:8193/dashboard#overview')
})

Given(/^I view the Daily New Users report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#daily_new_users')
})

Given(/^I view the Daily Publishers report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#dailyPublishers')
})

Given(/^I view the Daily Publishers Agg report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#dailyPublishersAgg')
})

Given(/^I view the Daily Crashes by Platform report$/, async function () {
  await browser.url('http://localhost:8193/dashboard#crashes_platform')
})

Then(/^the ref select should not be visible$/, async function () {
  const result = await browser.isVisible(`#ref-filter`)
  expect(result).to.equal(true)
})

Given(/^I pick "([^"]*)" days for the date range$/, async function (days) {
  await this.menuHelpers.setDaysBack(days)
})

When(/^I refresh the page$/, async function () {
  await browser.refresh()
  await browser.pause(1000)
})
Then(/^I should see "([^"]*)" days for the date range$/, async function (days) {
  const selected = await this.menuHelpers.getDaysBackSelected()
  expect(selected).to.include(days, `the day selection box should have ${days} days selected`)
})

When(/^I enter in the referal code "([^"]*)"$/, async function (code_text) {
  this.menuHelpers.addToRefBox(code_text)
})

Then(/^I should see the code "([^"]*)" in the referal code box$/, async function (code_text) {
  const codes = await this.menuHelpers.selectedReferralCodes()
  expect(codes).to.include(code_text)

})

Given(/^I search the sidebar filter for (.*)$/, async function (menuSearchItem) {
  await browser.waitForVisible('#searchLinks', 3000)
  await browser.setValue('#searchLinks', menuSearchItem)
  await browser.pause(100)
})
Then(/^I should see (.*) at the top of the sidebar list$/, {
  timeout: 25000
}, async function (menuSearchItem) {
  await browser.waitUntil(async function () {
    let isVisible = await browser.isVisible(`#${menuSearchItem}`)
    return isVisible === true
  }, 10000, `could not find ${menuSearchItem} in the sidebar menu`)
  const allLi = await browser.getHTML('.sidebar > ul > li')
  const visibleLi = allLi.filter((li) => {
    return li.includes('display: none') === false
  })
  expect(visibleLi).to.have.property('length', 2)
  expect(visibleLi.toString()).to.contain(menuSearchItem)
})
When(/^I click the sidebar item (.*)$/, async function (menuSearchItem) {
  await browser.click(`#${menuSearchItem}`)
})
Then(/^I should see (.*) in the url bar and the report title (.*)$/, async function (path, title) {
  const url = await browser.getUrl()
  expect(url).to.contain(path)
  await browser.waitUntil(async function () {
    let text = await browser.getText('#page-load-status')
    return text === 'loaded'
  }, 10000, 'Page failed to finish loading')
  let contentTitle
  await browser.waitUntil(async () => {
    contentTitle = await this.menuHelpers.getContentTitle()
    return contentTitle.includes(title)
  }, 10000, `expected ${contentTitle} to contain ${title}`)
})

When(/^I filter by channel (.*)$/, async function (channel) {
  await this.menuHelpers.unsetAllChannels()
  await this.menuHelpers.setChannel(channel)
})
