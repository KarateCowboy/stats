/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
require('../test_helper')
const moment = require('moment')
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
          ref: 'BAR515'
        })
        try {
          await summary.save()
        } catch (e) {
          console.dir(summary, {colors: true})
        }
        working_day.add(1, 'days')
      }
    })
    describe('firstCount', async function () {
      it('returns a bunch of first counts', async function () {
        const linuxCount = await knex('dw.fc_usage').sum('total').where('ymd', '>=', month_start.format('YYYY-MM-DD')).andWhere({
          'platform': 'linux',
          'channel': 'dev',
          'first_time': true
        }).whereIn('ref', ['BAR515', 'AIR449'])
        let result = await db.UsageSummary.firstCount(month_start.format('YYYY-MM-DD'), ['linux'], ['dev'], ['BAR515', 'AIR449'])
        const total = result.rows.reduce((total, current) => { return total += parseInt(current.first_count) }, 0)
        expect(result.rows.length).to.be.greaterThan(10)
        expect(total).to.equal(parseInt(linuxCount[0].sum))
      })
    })
    describe('platformMinusFirstSQL', async function () {
      it('returns overall usage', async function () {
        const linuxCount = await knex('dw.fc_usage').sum('total').where('ymd', '>=', month_start.format('YYYY-MM-DD')).andWhere({
          'platform': 'linux',
          'channel': 'dev',
          'first_time': true
        }).whereIn('ref', ['BAR515', 'AIR449'])
        let result = await db.UsageSummary.platformMinusFirstSQL(month_start.format('YYYY-MM-DD'), ['linux'], ['dev'], ['BAR515', 'AIR449'])
        for (let row of result.rows) {
          expect(row.all_count - row.first_count).to.equal(Number(row.count))
        }
        const total = result.rows.reduce((total, current) => { return total += parseInt(current.first_count) }, 0)
        expect(result.rows.length).to.be.greaterThan(10)
        expect(total).to.equal(parseInt(linuxCount[0].sum))
      })
      it('accepts a date string or a numeric "days back" string', async function () {
        let ymd_range = Math.abs(month_start.diff(moment(), 'days'))
        ymd_range = ymd_range.toString() + ' days'

        const linuxCount = await knex('dw.fc_usage').sum('total').where('ymd', '>=', month_start.format('YYYY-MM-DD')).andWhere({
          'platform': 'linux',
          'channel': 'dev',
          'first_time': true
        }).whereIn('ref', ['BAR515', 'AIR449'])

        let result = await db.UsageSummary.platformMinusFirstSQL(ymd_range, ['linux'], ['dev'], ['BAR515', 'AIR449'])
        for (let row of result.rows) {
          expect(row.all_count - row.first_count).to.equal(Number(row.count))
        }
        const total = result.rows.reduce((total, current) => { return total += parseInt(current.first_count) }, 0)
        expect(result.rows.length).to.be.greaterThan(10)
        expect(total).to.equal(parseInt(linuxCount[0].sum))
      })
    })
  })
})
