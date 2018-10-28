const { Given, When, Then } = require('cucumber')
const { expect } = require('chai')
const moment = require('moment')

Given(/there are "([^"]*)" weeks of "([^"]*)" downloads/, async function(weeks, platform) {
  const today = moment()
  const weeks_ago = moment().subtract(weeks,'weeks')
  const current_day = moment()
  while(current_day.isAfter(weeks_ago)){
    let download = await factory.build('download', { platform: platform})
    await download.save()
    current_day.subtract(1,'days')
  }
});

Given(/I view the Downloads page/, async function() {
  await browser.click('#mnDownloads')
});

Then(/I should see a column and count for each type and week/, async function() {
  const page_html = await browser.getHTML('body')
  expect(page_html).to.contain("Hello World")
});
