const moment = require('moment')
const TestHelper = require('../test_helper').TestHelper
const _ = require('underscore')
//io
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
    const week_diff = await fs.readFile('./migrations/0060-week-diff/up.sql', 'utf8')
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
  describe('#transfer_platform_aggregate', function () {
    it('projects properties', async function () {
      //setup
      const WeekOfInstall = require('../../src/models/retention').WeekOfInstall
      const android_usages = []
      for (let i in _.range(10)) {
        const usage = await factory.build('android_usage')
        await usage.save()
        android_usages.push(usage)
      }
      const properties = ['platform', 'version', 'first_time', 'channel', 'ymd', 'woi', 'ref']
      const cutoff = moment(android_usages[0].woi).subtract(3, 'days')

      //execution
      await WeekOfInstall.transfer_platform_aggregate('android_usage', cutoff.format('YYYY-MM-DD'))
      //validation
      const android_usage_woi_aggs = await mongo_client.collection('android_usage_aggregate_woi').find().toArray()
      for (let property of properties) {
        expect(android_usage_woi_aggs[0]._id).to.have.property(property)
      }
    })
  })
  describe('#from_usage_aggregate_woi', function () {
    const WeekOfInstall = require('../../src/models/retention').WeekOfInstall
    it('scrubs ios_usage records', async function () {
      const ios_usage_aggregate_woi = await factory.build('ios_usage_record_bad_woi')
      const raw_record = {
        '_id': ios_usage_aggregate_woi,
        'count': 3
      }
      const retention_week = WeekOfInstall.from_usage_aggregate_woi(raw_record)
      expect(retention_week.woi).to.match(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/)
    })
    it('sets the row\'s total from the count', async function () {
      const ios_usage_aggregate_woi = await factory.build('ios_usage_aggregate_woi')
      const raw_record = {
        '_id': ios_usage_aggregate_woi,
        'count': 20
      }
      const retention_week = WeekOfInstall.from_usage_aggregate_woi(raw_record)
      expect(retention_week.total).to.equal(raw_record.count)
    })
  })
})

describe('RetentionWeek', function () {
  const RetentionWeek = require('../../src/models/retention').RetentionWeek
  describe('#refresh', function () {
    it('refreshes the materializied view', async function () {
      //setup
      const rows = await knex('dw.fc_retention_week_mv').count('*')
      expect(rows[0].count).to.equal('0')
      const f = await factory.build('fc_retention_woi')
      await f.save()
      //execution
      await RetentionWeek.refresh()
      //validation
      const rows_in_view = await knex('dw.fc_retention_week_mv').count('*')
      expect(Number(rows_in_view[0].count)).to.be.above(0)
    })
  })
})

describe('RetentionMonth', function () {
  const RetentionMonth = require('../../src/models/retention').RetentionMonth
  describe('#refresh', function () {
    it('refreshes the materialized view', async function () {
      //setup
      const rows = await knex('dw.fc_retention_month_mv').count('*')
      expect(rows[0].count).to.equal('0')
      const f = await factory.build('fc_retention_woi')
      await f.save()
      //execution
      await RetentionMonth.refresh()
      //validation
      const rows_in_view = await knex('dw.fc_retention_month_mv').count('*')
      expect(Number(rows_in_view[0].count)).to.be.above(0)
    })
  })
})
