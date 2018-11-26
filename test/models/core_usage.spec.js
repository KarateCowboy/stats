/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const moment = require('moment')
const _ = require('underscore')
require('../test_helper')
const CoreUsage = require('../../src/models/core-usage.model')()

describe('CoreUsage', async function () {
  describe('schema', async function () {
    specify(' year_month_day: {type: String},', async function () {
      const core_usage = new CoreUsage()
      expect(core_usage).to.have.property('year_month_day', moment().format('YYYY-MM-DD'))
    })
    specify('  woi: {type: String},', async function () {
      const core_usage = new CoreUsage()
      expect(core_usage).to.have.property('woi', moment().startOf('week').add(1, 'days').format('YYYY-MM-DD'))
    })
    specify(' ref: {type: String},', async function () {
      const core_usage = new CoreUsage()
      expect(core_usage).to.have.property('ref', 'none')
    })
    specify(' platform: {type: String},', async function () {
      let thrown = false
      try {
        const core_usage = new CoreUsage()
      } catch (e) {
        thrown = true
        expect(e.message).to.contain()
      }
    })
    specify(' version: {type: String}, ', async function () {})
    specify(' channel: {type: String}, ', async function () {})
    specify(' daily: Boolean,', async function () {})
    specify(' weekly: Boolean, ', async function () {})
    specify(' monthly: Boolean, ', async function () {})
    specify(' first: Boolean, ', async function () {})
    specify(' ts: {type: Number}, ', async function () {})
    specify(' aggregated_at: {type: Date},', async function () {})
  })
  describe('class methods', async function () {
    describe('monthly_active_users', async function () {
      it('takes a moment and returns the count', async function () {
        const ymd = moment().startOf('month').add(3, 'days')
        const monthly_usages = await factory.createMany('core_winx64_usage', 321, {
          monthly: true,
          year_month_day: ymd.format('YYYY-MM-DD')
        })
        await factory.createMany('core_winx64_usage', 642, {
          monthly: false,
          year_month_day: ymd.format('YYYY-MM-DD')
        })
        const monthly_usage_count = await CoreUsage.monthly_active_users(ymd)
        expect(monthly_usage_count).to.equal(monthly_usages.length)
      })
    })
  })
})
