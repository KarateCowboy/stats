const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Given(/^I click the menu item for monthly retention$/, async function () {
  expect(await browser.getUrl()).to.include('dashboard')
  await browser.click_when_visible('#mnRetentionMonth')
})

Then(/^I should see the report page for monthly retention$/, async function () {
  await browser.waitForVisible('#retentionMonthTableContainer', 2000)
  const table_html = await browser.getHTML('#retentionMonthTableContainer')
  expect(table_html).to.include('Months from installation')

  const body_html = await browser.getHTML('body')
  expect(body_html).to.include('Retention Month over Month')
})
