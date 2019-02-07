const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Given('I go to the Daily Active Users by Platform Report', async function () {
  await browser.url('http://localhost:8193/dashboard#usage')
})

