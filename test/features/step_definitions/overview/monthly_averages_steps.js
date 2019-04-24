const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')

Given(/^there are core usages for the last six months$/, async function () {
  let fc_usage = await factory.create('fc_usage', {platform: 'winx64-bc'})
  let fc_usage_month = await factory.create('fc_usage_month', {platform: 'winx64-bc'})
  this.setTo('total_core_usages', fc_usage_month.total)
  // non core
  fc_usage = await factory.create('fc_usage', {platform: 'winx64-bc'})
  fc_usage_month = await factory.create('fc_usage_month', {platform: 'winx64-bc', total: 714})
  this.setTo('total_win_usages', fc_usage_month.total)
  await build_months_back('winx64-bc')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
})
Then(/^I should see the averages laid out for the core usages$/, async function () {
  await browser.waitForVisible('#monthly-averages-table > tbody > tr', 3000)
  const table_body_html = await browser.getHTML('#monthly-averages-table > tbody')
  expect(table_body_html).to.contain('winx64-bc')
})

const build_months_back = async function (platform) {
  const _ = require('underscore')
  const ymd = moment().startOf('month').add(14, 'days')
  for (let i of _.range(1, 13)) {
    let calc_ymd = ymd.clone().subtract(i, 'months').format('YYYY-MM-DD')
    let fc_usage = await factory.create('fc_usage', {
      platform: platform,
      ymd: calc_ymd
    })
    let fc_usage_month = await factory.build('fc_usage_month', {
      ymd: calc_ymd,
      platform: platform
    })
    await fc_usage_month.save()
  }

}
