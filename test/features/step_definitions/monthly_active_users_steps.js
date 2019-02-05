/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const _ = require('underscore')

const MonthUpdate = require('../../../src/services/update-postgres-month.service')
const UpdatePostgresDayService = require('../../../src/services/update-postgres-day.service')
const CoreUsage = require('../../../src/models/core-usage.model')()

let testing_ymd

Given(/^there are "([^"]*)" usages for the prior month$/, {timeout: 100000}, async function (number_of_usages) {
  await build_monthly_usages(number_of_usages)
})

Given(/^there are "([^"]*)" mixed ref usages for the prior month$/, {timeout: 100000}, async function (number_of_usages) {
  await build_monthly_usages(number_of_usages, true)
})

build_monthly_usages = async (number_of_usages, mixed_ref = false, other_attributes = null) => {
  const per_day = Math.ceil(Number(number_of_usages) / 28)
  const working_date = moment().startOf('month').subtract(2, 'weeks').startOf('month')
  testing_ymd = working_date.clone()
  const usages = []
  for (let i of _.range(1, 29)) {
    working_date.add(1, 'days')
    let refs = []
    if (!mixed_ref) {
      const noneRef = new db.ReferralCode({code_text: 'none'})
      refs.push(noneRef)
    } else {
      const campaigns = await factory.createMany('campaign', 3, {created_at: working_date.toDate()})
      await Promise.all(campaigns.map(async (c) => {
        let newRefs = await factory.createMany('ref_code_pg', 5, {campaign_id: c.id})
        refs.push(newRefs)
      }))
      refs = _.flatten(refs)
    }
    for (let ref of refs) {
      for (let j of _.range(1, (per_day + 1) / refs.length)) {
        const build_args = {
          year_month_day: working_date.format('YYYY-MM-DD'),
          woi: working_date.clone().subtract(7, 'days').format('YYYY-MM-DD'),
          ts: () => { return working_date.clone().toDate().getTime()},
          ref: ref.get('code_text'),
          channel: 'release'
        }
        if (other_attributes) {
          Object.assign(build_args, other_attributes)
        }
        let usage = await factory.attrs('core_winx64_usage', build_args)
        usages.push(usage)
      }
    }
  }
  await mongo_client.collection('brave_core_usage').insertMany(usages.slice(0, number_of_usages))
  const month_service = new MonthUpdate()
  await month_service.main('brave_core_usage', moment().subtract(5, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
  const day_service = new UpdatePostgresDayService()
  await day_service.main('brave_core_usage', 172)
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_usage_platform_mv')
}

Then(/^I should see the "([^"]*)" MAU for the prior month on winx64\-bc$/, async function (number_of_users) {
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(usage_data_table).to.contain(number_of_users)
})

Given(/^there is complete monthly usage data in the tables$/, async function () {
  const platforms = ['ios', 'androidbrowser', 'linux', 'winia32', 'winx64', 'osx', 'linux-bc', 'osx-bc', 'winx64-bc']
  const today = moment()
  for (let platform of platforms) {
    const usages = await factory.createMany('fc_usage_month', _.range(1, 91).map((i) => {
      return {
        platform: platform,
        ymd: today.clone().subtract(i, 'days').format('YYYY-MM-DD')
      }
    }))
    await Promise.all(usages.map(async (u) => { await u.save() }))
  }
})

Given(/^"([^"]*)" mau data is missing$/, async function (platform) {
  await knex('dw.fc_usage_month').where('platform', platform).delete()
})
Given(/^I enter an existing referral code in the text box$/, async function () {
  let sample = await db.ReferralCode.where('code_text', '!=', 'none').fetch()
  this.setTo('sampleRef', sample)
  await browser.click_when_visible('#controls-selected-days')
  await browser.click('#controls-days-menu > li:nth-of-type(3)') //120 days
  await browser.click('#contentTitle') // hide drop-down / remove from focus
  await browser.keys(sample.get('code_text'))
  await  browser.pause(300)
  await browser.click('#ref-filter')
  await browser.keys(sample.get('code_text'))
  await browser.keys('\uE007')
  await  browser.pause(550)
  await browser.keys('\uE007')
  await  browser.pause(550)
})

Then(/^the report should limit to the existing referrals statistics$/, async function () {
  const total = await mongo_client.collection('brave_core_usage').count({
    ref: this.sampleRef.code_text
  })
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
})

Then(/^the report should show only the average dau for that referral code$/, async function () {
  const count_for_day = await CoreUsage.count({ref: this.sampleRef.get('code_text')})
  const usage_data_table = await browser.getHTML('#usageDataTable')
  expect(count_for_day).to.be.greaterThan(0, 'count to check for should be greater than 0')
  expect(usage_data_table).to.contain(Math.round(count_for_day / 30))
})

Then(/^I should see monthly average for all referral codes$/, async function () {
  const count_for_day = await CoreUsage.count({})
  const usage_data_table = await browser.getHTML('#usageDataTable')
  const ave_monthly_dau = await knex('dw.fc_average_monthly_usage_mv').select('ymd').sum({'count': 'average_dau'}).groupBy('ymd').orderBy('ymd', 'desc')
  expect(usage_data_table).to.contain(parseInt(_.first(ave_monthly_dau).count).toLocaleString('en'))

})

Given(/^there are "([^"]*)" returning mixed ref usages for the prior month$/, {timeout: 10000}, async function (number_of_usages) {
  const firstTimeUsages = await CoreUsage.find({})
  let refs = firstTimeUsages.map(u => u.ref)
  refs = _.uniq(refs)
  const usagesPerRef = parseInt(number_of_usages / refs.length)
  await Promise.all(refs.map(async (ref) => {
    const usages = await factory.buildMany('core_winx64_usage', usagesPerRef, {
      ref: ref,
      first: false,
      year_month_day: moment().endOf('month').format('YYYY-MM-DD')
    })
    await CoreUsage.insertMany(usages)
  }))
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_usage_platform_mv')
  const month_service = new MonthUpdate()
  await month_service.main('brave_core_usage', moment().subtract(5, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
  const day_service = new UpdatePostgresDayService()
  await day_service.main('brave_core_usage', 172)
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_average_monthly_usage_mv')
  await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_usage_platform_mv')

  // await CoreUsage.save(_.flatten(allUsages))
})

Then(/^I should see MAU for all referral codes$/, async function () {
  const total = await CoreUsage.count({
    monthly: true
  })
  expect(total).to.be.greaterThan(0, 'Total should be more than 0')
  const usageData = await browser.getHTML('#usageContent .table-responsive')
  expect(usageData).to.include(total.toLocaleString('en'))
})
