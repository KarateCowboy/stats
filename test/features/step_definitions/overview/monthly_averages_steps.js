const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Given(/^there are core usages for the last six months$/, async function () {
  let fc_usage = await factory.build('fc_usage', {platform: 'winx64-bc'})
  await fc_usage.save()
  let fc_usage_month = await factory.build('fc_usage_month', { platform: 'winx64-bc'})
  await fc_usage_month.save()
  this.setTo('total_core_usages', fc_usage_month.total)
  // non core
  fc_usage = await factory.build('fc_usage' )
  await fc_usage.save()
  fc_usage_month = await factory.build('fc_usage_month', { total: 714 } )
  await fc_usage_month.save()
  this.setTo('total_win_usages', fc_usage_month.total)
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
})
Then(/^I should see the averages laid out for the core usages$/, async function () {
  const table_body_html = await browser.getHTML('#monthly-averages-table > tbody')
  expect(table_body_html).to.contain('winx64-bc')
  expect(table_body_html).to.contain(this.total_core_usages)
  expect(table_body_html).to.contain(Math.ceil(this.total_core_usages / 30))

  expect(table_body_html).to.contain(this.total_win_usages)
})
