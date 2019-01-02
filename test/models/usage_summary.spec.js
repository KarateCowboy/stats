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
      usageSummary = new db.UsageSummary(fc_usage_attributes)
      await usageSummary.save()
    })
    specify('created_at', async function () {
      expect(usageSummary).to.have.property('created_at')
    })
    specify('updated_at', async function () {
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
  describe('platformMinusFirst', async function () {
    let month_start
    beforeEach(async function () {
      this.timeout(5000)
      month_start = moment().subtract(1, 'months').startOf('month')
      const working_day = month_start.clone()
      while (working_day.isSameOrBefore(month_start.clone().endOf('month'))) {
        let summary = await factory.build('fc_usage', {
          platform: 'linux',
          ymd: working_day.format('YYYY-MM-DD'),
          ref: 'BAR515',
          first_time: true
        })
        let returning_summary = await factory.build('fc_usage', {
          platform: 'linux',
          ymd: working_day.format('YYYY-MM-DD'),
          ref: 'BAR515',
          first_time: false,
          total: 400
        })
        try {
          await summary.save()
          await returning_summary.save()
        } catch (e) {
        }
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
    before(async function () {
      ymds = _.range(0, 20).map((i) => { return {ymd: (moment().subtract(i, 'days').format('YYYY-MM-DD'))}})
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
      specify('version', async function () {
        const second_version = '9.9.9'
        const ymd_dupe = _.cloneDeep(ymds).map(y => {
          y.version = second_version
          return y
        })
        ymds = ymds.concat(ymd_dupe)
        const usage_summaries = await factory.createMany('fc_usage', ymds)
        let ormResults = await db.UsageSummary.dailyActiveUsers({
          daysAgo: 20,
          platforms: platforms,
          channels
        }, ['version'])
        const first_version = _.uniq(usage_summaries.map(u => u.version)).filter(u => u !== second_version).pop()
        expect(ormResults.rows).to.have.property('length', 40)
        expect(_.uniq(ormResults.rows.map(r => r.version))).to.have.members([first_version, second_version])
        const ormSample = _.first(ormResults.rows)
        const fc_total = (await knex('dw.fc_usage').sum('total')).shift()
        const sample_total = await knex('dw.fc_usage').sum('total').where('ymd', ormSample.ymd)
        const expected_daily_percentage = (fc_total.sum / sample_total[0].sum) * 100
        expect(ormResults.rows[0]).to.have.property('daily_percentage', 50)
      })
    })
  })
})
