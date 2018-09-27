const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')

Given(/^there are core usages for the last six months$/, async function () {
  let fc_usage = await factory.build('fc_usage', {platform: 'winx64-bc'})
  await fc_usage.save()
  let fc_usage_month = await factory.build('fc_usage_month', {platform: 'winx64-bc'})
  await fc_usage_month.save()
  this.setTo('total_core_usages', fc_usage_month.total)
  // non core
  fc_usage = await factory.build('fc_usage')
  await fc_usage.save()
  fc_usage_month = await factory.build('fc_usage_month', {total: 714})
  await fc_usage_month.save()
  this.setTo('total_win_usages', fc_usage_month.total)
  await build_months_back('linux')
  await build_months_back('androidbrowser')
  await build_months_back('osx-bc')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
})
Then(/^I should see the averages laid out for the core usages$/, async function () {
  await browser.waitForVisible('#monthly-averages-table > tbody > tr', 700)
  const table_body_html = await browser.getHTML('#monthly-averages-table > tbody')
  expect(table_body_html).to.contain('winx64-bc')
  expect(table_body_html).to.contain('linux')
  expect(table_body_html).to.contain('Android Browser')
  expect(table_body_html).to.contain('osx-bc')
  expect(table_body_html).to.contain(this.total_core_usages)
  expect(table_body_html).to.contain(Math.ceil(this.total_core_usages / 30))

  expect(table_body_html).to.contain(this.total_win_usages)
})

const build_months_back = async function (platform) {
  const _ = require('underscore')
  const ymd = moment().startOf('month').add(14, 'days')
  for (let i of _.range(1, 13)) {
    let calc_ymd = ymd.clone().subtract(i, 'months').format('YYYY-MM-DD')
    let fc_usage = await factory.build('fc_usage', {
      platform: platform,
      ymd: calc_ymd
    })
    await fc_usage.save()
    let fc_usage_month = await factory.build('fc_usage_month', {
      ymd: calc_ymd,
      platform: platform
    })
    await fc_usage_month.save()
  }

}
