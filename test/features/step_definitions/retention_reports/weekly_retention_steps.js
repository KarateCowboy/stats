const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Given(/^I am logged in to the system$/, async function () {
  await browser.url('http://localhost:8193')
  await browser.waitForVisible('#inputEmail', 3000)
  await browser.setValue('#inputEmail', 'admin')
  await browser.setValue('#inputPassword', this.adminPassword)
  await browser.click('.btn-primary')
})

Given(/^I click the menu item for weekly retention$/, async function () {
  expect(await browser.getUrl()).to.include("dashboard")
  await browser.click_when_visible('#weeklyRetention')
})

Then(/^I should see the report page for weekly retention$/, async function () {
  await browser.waitForVisible('#weeklyRetentionTableContainer', 2000)
  const table_html = await browser.getHTML("#weeklyRetentionTableContainer")
  expect(table_html).to.include('Weeks since installation')

  const body_html = await browser.getHTML('body')
  expect(body_html).to.include('Weekly Retention')
})
