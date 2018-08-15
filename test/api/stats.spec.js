/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const moment = require('moment')
require('../test_helper')
const WeekOfInstall = require('../../src/models/retention').WeekOfInstall
const UsageAggregateWOI = require('../../src/models/usage_aggregate_woi').UsageAggregateUtil
const main = require('../../src/index')
const _ = require('underscore')

describe('/retention_week', async function () {
  it('allows filtering by ref', async function () {
    this.timeout(10000)
    let excluded_retention_woi = await factory.build('fc_retention_woi', {ref: 'none'})
    await excluded_retention_woi.save()
    let included_retention_woi = await factory.build('fc_retention_woi', {ref: '123ABC'})
    await included_retention_woi.save()
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_week_mv')
    const server = await main.setup({pg: pg_client, mg: mongo_client})

    // execution
    let params = {
      method: 'GET',
      url: `/api/1/retention_week?platformFilter=winx64&channelFilter=dev&ref=123ABC`
    }
    //validation
    let response = await server.inject(params)
    let payload = JSON.parse(response.payload)
    expect(payload[0].starting).to.equal(included_retention_woi.total)
  })
  it.skip('returns twelve rows/three months of data', async function () {
    this.timeout(30000)
    // Setup
    let usages = []
    let week_of_install = moment().subtract(12, 'weeks').startOf('week').add(1, 'days')
    for (let week = 1; week <= 12; week++) {
      const ymd = moment().subtract((week * 7 + 2), 'days').format('YYYY-MM-DD')
      for (let i = 1; i <= 100 * week; i++) {
        const usage = await factory.build('android_usage', {
          woi: week_of_install.format('YYYY-MM-DD'),
          year_month_day: ymd,
          ref: 'none',
          platform: 'android'
        })
        usages.push(usage)
      }
    }
    await Promise.all(usages.map(async (usage) => { await usage.save() }))
    await WeekOfInstall.transfer_platform_aggregate('android_usage', week_of_install.format('YYYY-MM-DD'))
    // const android_aggregates = await mongo_client.collection('android_usage_aggregate_woi').find({}).toArray()
    for (let aa of android_aggregates) {
      const scrubbed_row = UsageAggregateWOI.scrub(aa)
      row = WeekOfInstall.from_usage_aggregate_woi(scrubbed_row)

      await knex('dw.fc_retention_woi').insert({
        ymd: row.ymd,
        platform: row.platform,
        version: row.version,
        channel: row.channel,
        woi: row.woi,
        ref: row.ref,
        total: row.total
      })
    }
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_week_mv')
    const server = await main.setup({pg: pg_client, mg: mongo_client})

    // execution
    const params = {
      method: 'GET',
      url: `/api/1/retention_week?platformFilter=androidbrowser&channelFilter=stable`
    }
    const response = await server.inject(params)
    const payload = JSON.parse(response.payload)
    expect(payload.length).to.be.above(10)
    expect(payload.length).to.be.below(13)

    let week = payload.find(i => i.week_delta === 0)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(99, 100)
    week = payload.find(i => i.week_delta === 1)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(91, 93)
    week = payload.find(i => i.week_delta === 2)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(81, 83)
    week = payload.find(i => i.week_delta === 3)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(74, 76)
    week = payload.find(i => i.week_delta === 4)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(65, 67)
    week = payload.find(i => i.week_delta === 5)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(58, 59)
    week = payload.find(i => i.week_delta === 6)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(50, 51)
    week = payload.find(i => i.week_delta === 7)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(41, 42)
    week = payload.find(i => i.week_delta === 8)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(33, 34)
    week = payload.find(i => i.week_delta === 9)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(25, 26)
    week = payload.find(i => i.week_delta === 10)
    expect(week.retained_percentage.toFixed(2) * 100).to.be.closeTo(16, 17)
  })
})
describe('/monthly_average_stats_platform', async function(){
  it('returns a bunch of things', async function(){
    const server = await main.setup({pg: pg_client, mg: mongo_client})

    // execution
    let params = {
      method: 'GET',
      url: `/api/1/monthly_average_stats_platform?platformFilter=winx64&channelFilter=dev&ref=123ABC`
    }
    let response = await server.inject(params)
    //validation
    let payload = JSON.parse(response.payload)

    expect(payload).to.not.equal(null)
  })
})
