/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
require('../test_helper')
const moment = require('moment')
const _ = require('lodash')

describe('UsageSummary model', async function () {
  describe('attributes', async function () {
    let usageSummary
    beforeEach(async function () {
      const fc_usage_attributes = await factory.attrs('fc_usage')
      usageSummary = await db.UsageSummary.query().insert(fc_usage_attributes)
    })
    specify.skip('created_at', async function () {
      expect(usageSummary).to.have.property('created_at')
    })
    specify.skip('updated_at', async function () {
      expect(usageSummary).to.have.property('updated_at')
    })
    specify('ymd', async function () {
      expect(usageSummary).to.have.property('ymd')
    })
    specify('platform', async function () {
      expect(usageSummary).to.have.property('platform')
    })
    specify('version', async function () {
      expect(usageSummary).to.have.property('version')
    })
    specify('firstTime', async function () {
      expect(usageSummary).to.have.property('first_time')
    })
    specify('total', async function () {
      expect(usageSummary).to.have.property('total')
    })
    specify('channel', async function () {
      expect(usageSummary).to.have.property('channel')
    })
    specify('ref', async function () {
      expect(usageSummary).to.have.property('ref')
    })
  })
  describe('dauVersion', async function () {
    it('returns the same results as the old query when given no ref', async function () {
      let fixture_params = []
      _.range(1, 6).forEach((version_counter) => {
        const version = `${version_counter}.0.0`
        let ymd = moment().subtract(10, 'days').format('YYYY-MM-DD')
        let refs = _.range(1, 101).map((u) => {
          return _.random(100000, 999999).toString()
        })
        fixture_params = fixture_params.concat(_.uniq(refs).map((u) => { return {ymd: ymd, ref: u, version: version} }))
      })
      const usage_summaries = await factory.createMany('fc_usage', fixture_params)
      const DAU_VERSION = `SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.version,
  SUM(FC.total) AS count,
  ROUND(SUM(FC.total) / ( SELECT SUM(total) FROM dw.fc_usage WHERE ymd = FC.ymd AND platform = ANY ($2) AND channel = ANY ($3) ), 3) * 100 AS daily_percentage
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = COALESCE($4, ref)
GROUP BY FC.ymd, FC.version
ORDER BY FC.ymd DESC, FC.version`
      const args = {
        daysAgo: 20,
        channel: (await db.Channel.query()).map(c => c.channel),
        platform: (await db.Platform.query()).map(p => p.platform)
      }
      const oldResults = (await pg_client.query(DAU_VERSION, [`${args.daysAgo} days`, args.platform, args.channel, null])).rows
      expect(_.gt(oldResults.length, 0)).to.equal(true, 'should return some results')
      const newResults = await db.UsageSummary.dauVersion(args)
      expect(newResults.length).to.be.above(0)
      expect(oldResults.length).to.equal(newResults.length, 'old and new results should return the same number of rows')

      oldResults.forEach(old => {
        const newer = _.find(newResults, {ymd: old.ymd, version: old.version})
        expect(newer).to.not.equal(null)
        expect(newer.count).to.equal(old.count, 'the counts should be equal')
      })
      // produces the same result when 'condensed'
      const dataset = require('../../src/api/dataset')
      const condensed_old_results = dataset.condense(oldResults, 'ymd', 'version')
      const condensed_new_results = dataset.condense(newResults, 'ymd', 'version')
      expect(condensed_new_results.toString()).to.equal(condensed_old_results.toString())
    })
  })
  describe('platformMinusFirst', async function () {
    let month_start
    beforeEach(async function () {
      this.timeout(5000)
      month_start = moment().subtract(1, 'months').startOf('month')
      const working_day = month_start.clone()
      while (working_day.isSameOrBefore(month_start.clone().endOf('month'))) {
        let summary = await factory.create('fc_usage', {
          platform: 'linux',
          ymd: working_day.format('YYYY-MM-DD'),
          ref: 'BAR515',
          first_time: true
        })
        let returning_summary = await factory.create('fc_usage', {
          platform: 'linux',
          ymd: working_day.format('YYYY-MM-DD'),
          ref: 'BAR515',
          first_time: false,
          total: 400
        })
        working_day.add(1, 'days')
      }
    })
    it('accepts a date string or a numeric "days back" string', async function () {
      let ymd_range = Math.abs(month_start.diff(moment(), 'days'))
      ymd_range = ymd_range.toString() + ' days'

      const linuxCount = await knex('dw.fc_usage').sum('total').where('ymd', '>=', month_start.format('YYYY-MM-DD')).andWhere({
        'platform': 'linux',
        'channel': 'dev',
        'first_time': true
      }).whereIn('ref', ['BAR515', 'AIR449'])

      let result = await db.UsageSummary.platformMinusFirst(ymd_range, ['linux'], ['dev'], ['BAR515', 'AIR449'])
      for (let row of result.rows) {
        expect(row.all_count > row.first_count).to.equal(true, 'all_count should be greater than first_count')
        expect(row.all_count - row.first_count).to.equal(Number(row.count))
      }
      const total = result.rows.reduce((total, current) => { return total += parseInt(current.first_count) }, 0)
      expect(result.rows.length).to.be.greaterThan(10)
      expect(total).to.equal(parseInt(linuxCount[0].sum))
    })
    it('works when searching with no ref code', async function () {
      let ymd_range = Math.abs(month_start.diff(moment(), 'days'))
      ymd_range = ymd_range.toString() + ' days'

      const linuxCount = await knex('dw.fc_usage').sum('total').where('ymd', '>=', month_start.format('YYYY-MM-DD')).andWhere({
        'platform': 'linux',
        'channel': 'dev',
        'first_time': true
      })

      let result = await db.UsageSummary.platformMinusFirst(ymd_range, ['linux'], ['dev'])
      for (let row of result.rows) {
        expect(row.all_count > row.first_count).to.equal(true, 'all_count should be greater than first_count')
        expect(row.all_count - row.first_count).to.equal(Number(row.count))
      }
      const total = result.rows.reduce((total, current) => { return total += parseInt(current.first_count) }, 0)
      expect(result.rows.length).to.be.greaterThan(10)
      expect(total).to.equal(parseInt(linuxCount[0].sum))
    })
  })
  describe('dailyActiveUsers', async function () {
    let ymds, platforms, channels, ref
    beforeEach(async function () {
      ymds = _.range(0, 20).map((i) => {
        return {
          ref: 'none',
          ymd: (moment().subtract(i, 'days').format('YYYY-MM-DD'))
        }
      })
      platforms = ['winx64']
      channels = ['dev']
      ref = ['none']
    })
    it('returns the same results as the original DAU query', async function () {
      const DAU = `
SELECT TO_CHAR(ymd, 'YYYY-MM-DD') AS ymd, SUM(total) AS count
FROM dw.fc_usage
WHERE
  ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  platform = ANY ($2) AND
  channel = ANY ($3) AND
  ref = ANY($4)
GROUP BY ymd
ORDER BY ymd DESC
`
      await factory.createMany('fc_usage', ymds)
      const queryResults = await pg_client.query(DAU, ['20 days', platforms, channels, ref])
      const ormResults = await db.UsageSummary.dailyActiveUsers({daysAgo: 20, platforms: platforms, channels, ref})
      expect(queryResults.rows).to.have.property('length', ymds.length)
      expect(ormResults.rows).to.have.property('length', ymds.length)
      const querySample = queryResults.rows[0]
      const ormSample = ormResults.rows[0]
      expect(ormSample.ymd).to.be.a('string')
      expect(querySample.ymd).to.equal(moment(ormSample.ymd).format('YYYY-MM-DD'))
      expect(querySample.count).to.equal(ormSample.count)
    })
    it('appends the ref argument optionally', async function () {
      await factory.createMany('fc_usage', ymds)
      let ormResults = await db.UsageSummary.dailyActiveUsers({daysAgo: 20, platforms: platforms, channels})
      expect(ormResults.rows).to.have.property('length', ymds.length)
      ormResults = await db.UsageSummary.dailyActiveUsers({daysAgo: 20, platforms: platforms, channels, ref: []})
      expect(ormResults.rows).to.have.property('length', ymds.length)
    })
    context('group by', async function () {
      specify('platform', async function () {
        await factory.createMany('fc_usage', ymds)
        await factory.createMany('fc_usage', ymds.map(y => {
          y.platform = 'androidbrowser'
          return y
        }))

        platforms.push('androidbrowser')
        let ormResults = await db.UsageSummary.dailyActiveUsers({
          daysAgo: 20,
          platforms: platforms,
          channels
        }, ['platform'])
        expect(ormResults.rows).to.have.property('length', 40)
        expect(_.uniq(ormResults.rows.map(r => r.platform))).to.have.members(['winx64', 'androidbrowser'])
        expect(_.first(ormResults.rows)).to.have.property('daily_percentage')
      })
    })
  })
  describe('basicDau', async function () {
    it('returns an executable knex query', async function () {
      const dauQuery = db.UsageSummary.basicDau()
      expect(dauQuery.toString()).to.contain('platform')
    })
    it('includes and groups by platform, ymd, version, and accurate count', async function () {
      const yesterday = moment().subtract(1, 'days')
      await factory.create('fc_usage', {ymd: yesterday.format('YYYY-MM-DD')})
      await factory.create('fc_usage', {ymd: yesterday.format('YYYY-MM-DD')})
      await factory.create('fc_usage', {ymd: yesterday.format('YYYY-MM-DD')})
      const dauQuery = db.UsageSummary.basicDau()
      dauQuery.where('ymd', yesterday.format('YYYY-MM-DD'))
      const result = await dauQuery
      const manualCount = await db.UsageSummary.query().sum('total').where('ymd', yesterday.format('YYYY-MM-DD'))
      expect(parseInt(result[0].count)).to.equal(parseInt(manualCount[0].sum))
    })
  })
  context('Daily Active Users', async function () {
    describe('dauCampaign', async function () {
      context('columns/attributes returned', async function () {
        beforeEach(async function () {
          const attrs = _.range(0, 10).map((i) => { return {ymd: moment().subtract(i, 'days').format('YYYY-MM-DD')}})
          await factory.createMany('fc_usage', attrs)
        })
        it('includes the campaign, ymd, and count', async function () {
          const results = await db.UsageSummary.dauCampaign({daysAgo: 10})
          expect(_.every(results, ['ymd', 'campaign', 'count'])).to.equal(true)
        })
      })
    })
  })
  context('for campaigns', async function () {
    // context('dnuCampaign')
    // context('druCampaign')

  })
})
