const { Given, When, Then } = require('cucumber')
const { expect } = require('chai')
const moment = require('moment')

Given(/there are "([^"]*)" weeks of "([^"]*)" downloads/, async function (weeks, platform) {
  const today = moment()
  const weeks_ago = moment().subtract(weeks, 'weeks')
  const current_day = moment()
  while (current_day.isAfter(weeks_ago)) {
    let download = await factory.build('download', { platform: platform, timestamp: current_day.format()})
    await download.save()
    current_day.subtract(1, 'days')
  }
  await knex.raw('REFRESH MATERIALIZED VIEW dw.daily_downloads')
})

Given(/I view the Downloads page/, async function () {
  await browser.click('#downloads')
})

Then(/I should see a column and count for each type and week/, async function () {
  await browser.pause(1000)
  const page_html = await browser.getHTML('#usageDataTable')
  const android_occurrences = page_html.match(/androidbrowser/g).length
  expect(android_occurrences).to.equal(14)
})
