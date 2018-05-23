const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Given('I go to the Daily Active Users by Platform Report', async function () {
  await browser.url('http://localhost:8193/dashboard#usage')
})

Then(/I should see the Today\/This Month button/, async function () {
  const body_html = await browser.getHTML('body')
  const is_visible = await browser.isVisible('#btn-show-today')
  expect(body_html).to.include('Today / This Month')
})
