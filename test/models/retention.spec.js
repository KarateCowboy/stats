/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const moment = require('moment')
const TestHelper = require('../test_helper').TestHelper
const _ = require('underscore')
const UsageAggregateUtil = require('../../src/models/usage_aggregate_woi').UsageAggregateUtil
// io
const fs = require('fs-extra')

let test_helper

before(async function () {
  test_helper = new TestHelper()
  await test_helper.setup()
})
after(async function () {
  await test_helper.tear_down()
})
beforeEach(async function () {
  await test_helper.truncate()
  await test_helper.refresh_views()
})

describe('week_diff', function () {
  before(async function () {
    const week_diff = await fs.readFile('./migrations/0061-week-diff/up.sql', 'utf8')
    await pg_client.query(week_diff)
  })
  it('does 0 for less than a week', async function () {
    const date1 = moment().format('YYYY-MM-DD')
    const date2 = moment().subtract(4, 'days').format('YYYY-MM-DD')
    const result = await pg_client.query('SELECT week_diff($1,$2)', [date1, date2])
    expect(Number(result.rows[0].week_diff)).to.equal(0)
  })
  it('does 1 for 8 days', async function () {
    const date1 = moment().format('YYYY-MM-DD')
    const date2 = moment().subtract(8, 'days').format('YYYY-MM-DD')
    const result = await pg_client.query('SELECT week_diff($1,$2)', [date1, date2])
    expect(Number(result.rows[0].week_diff)).to.equal(1)
  })
  it('does 2 for 15 days', async function () {
    const date1 = moment().format('YYYY-MM-DD')
    const date2 = moment().subtract(15, 'days').format('YYYY-MM-DD')
    const result = await pg_client.query('SELECT week_diff($1,$2)', [date1, date2])
    expect(Number(result.rows[0].week_diff)).to.equal(2)
  })
})

describe('WeekOfInstall', function () {
  const WeekOfInstall = require('../../src/models/retention').WeekOfInstall
  describe('#transfer_platform_aggregate', function () {
    it('projects properties', async function () {
      // setup
      const android_usages = []
      for (let i in _.range(10)) {
        const usage = await factory.build('android_usage', {ref: 'none'})
        await usage.save()
        android_usages.push(usage)
      }
      const properties = ['platform', 'version', 'first_time', 'channel', 'ymd', 'woi', 'ref']
      const cutoff = moment(android_usages[0].woi).subtract(3, 'days')

      // execution
      await WeekOfInstall.transfer_platform_aggregate('android_usage', cutoff.format('YYYY-MM-DD'))
      // validation
      const android_usage_woi_aggs = await mongo_client.collection('android_usage_aggregate_woi').find().toArray()
      for (let property of properties) {
        expect(android_usage_woi_aggs[0]._id).to.have.property(property)
      }
      expect(android_usage_woi_aggs).to.have.property('length', 1)
    })
    it('truncates the aggregate_woi table for the platform', async function () {
      // setup
      const existing_usage_aggregate_woi = await factory.build('ios_usage_aggregate_woi')
      await existing_usage_aggregate_woi.save()
      const cutoff = moment(existing_usage_aggregate_woi._id.woi).subtract(3, 'days')

      // execution
      await WeekOfInstall.transfer_platform_aggregate('ios_usage', cutoff.format('YYYY-MM-DD'))
      // validation
      const ios_usage_woi_aggs = await mongo_client.collection('ios_usage_aggregate_woi').find().toArray()
      expect(ios_usage_woi_aggs.length).to.equal(0)
    })
    it('applies android scrubbing to android browser but not link bubble', async function () {
      const android_usage = await factory.build('android_usage', {platform: 'android', ref: 'none'})
      await android_usage.save()
      const link_bubble_usage = await factory.build('link_bubble_usage', {ref: 'none'})
      await link_bubble_usage.save()
      const cutoff = moment(android_usage.woi).subtract(10, 'days')

      // execution
      await WeekOfInstall.transfer_platform_aggregate('android_usage', cutoff.format('YYYY-MM-DD'))
      await WeekOfInstall.transfer_platform_aggregate('usage', cutoff.format('YYYY-MM-DD'))
      // validation
      const android_usage_aggs = await mongo_client.collection('android_usage_aggregate_woi').find().toArray()
      const usage_aggs = await mongo_client.collection('usage_aggregate_woi').find().toArray()
      expect(android_usage_aggs.length).to.equal(1)
      expect(android_usage_aggs[0]['_id'].platform).to.equal('androidbrowser')
      expect(usage_aggs.length).to.equal(1)
      expect(usage_aggs[0]['_id'].platform).to.equal('android')
    })
  })
  describe('#from_usage_aggregate_woi', function () {
    const WeekOfInstall = require('../../src/models/retention').WeekOfInstall
    it('scrubs ios_usage records', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      ios_usage_agg_woi._id.woi = '2018-1-1'
      const retention_week = WeekOfInstall.from_usage_aggregate_woi(ios_usage_agg_woi)
      expect(retention_week.woi).to.match(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/)
    })
    it('sets the row\'s total from the count', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      const retention_week = WeekOfInstall.from_usage_aggregate_woi(ios_usage_agg_woi)
      expect(retention_week.total).to.equal(ios_usage_agg_woi.count)
    })
  })
})

describe('RetentionWeek', function () {
  const RetentionWeek = require('../../src/models/retention').RetentionWeek
  describe('#refresh', function () {
    it('refreshes the materializied view', async function () {
      // setup
      const rows = await knex('dw.fc_retention_week_mv').count('*')
      expect(rows[0].count).to.equal('0')
      const f = await factory.build('fc_retention_woi')
      await f.save()
      // execution
      await RetentionWeek.refresh()
      // validation
      const rows_in_view = await knex('dw.fc_retention_week_mv').count('*')
      expect(Number(rows_in_view[0].count)).to.be.above(0)
    })
  })
  describe('#aggregated', async function () {
    it('includes all ref types', async function () {
      const usages = []
      let usage_day = await factory.build('ios_usage_aggregate_woi')
      await UsageAggregateUtil.transfer_to_retention_woi(usage_day)
      usage_day = await factory.build('ios_usage_aggregate_woi')
      usage_day._id.first_time = true
      usage_day._id.ref = 'ABCDEF'
      await UsageAggregateUtil.transfer_to_retention_woi(usage_day)
      usage_day = await factory.build('ios_usage_aggregate_woi')
      usage_day._id.first_time = true
      usage_day._id.ref = '123456'
      await UsageAggregateUtil.transfer_to_retention_woi(usage_day)
      await RetentionWeek.refresh()

      const results = await RetentionWeek.aggregated(['ios'], ['beta'])
      expect(Number(results[0].starting)).to.equal(3)
    })
    it('does not return extraneous, current week data', async function () {
      for (let r = 13; r >= 0; r--) {
        const woi = moment().subtract(r, 'weeks').startOf('week').add(1, 'days')
        for (let c = 0; c < r + 4; c++) {
          const year_month_day = moment().subtract(r, 'weeks').startOf('week').add((c * 7 + 1), 'days')
          const retention_woi = await factory.build('fc_retention_woi', {
            woi: woi,
            ymd: year_month_day,
            total: (r * 100) - (c * 100)
          })
          await retention_woi.save()
        }
      }
      await knex('dw.fc_retention_woi').where('total', 0).update('total', 30)
      await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_week_mv')
      const results = await RetentionWeek.aggregated(['winx64'], ['dev'])
      const grouped_results = _.groupBy(results, 'woi')
      const group_lengths = []
      for (let group in grouped_results) {
        group_lengths.push(grouped_results[group].length)
      }
      expect(group_lengths.join(',')).to.equal(_.range(1,13).reverse().join(','))
      let num = results.filter((r) => { return r.week_delta === 0}).length
      expect(num).to.equal(12)
      num = results.filter((r) => { return r.week_delta === 1}).length
      expect(num).to.equal(11)
      let week_deltas = results.map(r => r.week_delta).splice(0, 12)
      expect(week_deltas).to.equal(week_deltas.sort())
    })

  })
})

describe('RetentionMonth', function () {
  const RetentionMonth = require('../../src/models/retention').RetentionMonth
  describe('#refresh', function () {
    it('refreshes the materialized view', async function () {
      // setup
      const rows = await knex('dw.fc_retention_month_mv').count('*')
      expect(rows[0].count).to.equal('0')
      const f = await factory.build('fc_retention_woi')
      await f.save()
      // execution
      await RetentionMonth.refresh()
      // validation
      const rows_in_view = await knex('dw.fc_retention_month_mv').count('*')
      expect(Number(rows_in_view[0].count)).to.be.above(0)
    })
  })
})
