const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const sinon = require('sinon')
const common = require('../../../../src/api/common')
const promo_summary = require('../../../fixtures/summary')

Given(/^I visit the Overview page$/, async function () {
  common.prequest = async () => {
    return promo_summary
  }
  await browser.url('http://localhost:8193/dashboard#overview')
})
Then(/^I should see the Publisher Referral Widget and data displayed$/, async function () {
  let body_html = await browser.getHTML('body')
  expect(body_html).to.include('Publisher Referral Promo')
  await browser.waitForVisible('#publisher-referral-total-downloads', 4000)
  const td_row = await browser.getHTML('#publisher-referral-total-downloads')
  expect(td_row).to.contain('117,749')
})
