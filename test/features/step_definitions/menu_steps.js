/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Then(/^the "([^"]*)" channels should be checked$/, async function (buttons) {
  buttons = buttons.split(',')
  for (let button of buttons) {
    const result = await browser.getAttribute(`#btn-channel-${button}`, 'checked')
    expect(result, `button ${button} should be checked by default`).to.equal('true')
  }
})
Then(/^the ref select should be visible and have the 'none' ref entered$/, async function () {
  const result = await browser.getHTML(`#ref-filter .selected-tag`)
  expect(result).to.contain('none')
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
Then(/^the ref select should not be visible$/, async function(){
  const result = await browser.isVisible(`#ref-filter`)
  expect(result).to.equal(false)
})
