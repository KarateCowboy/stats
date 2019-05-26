/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const _ = require('lodash')
const apiCommon = require('../../../src/api/common')

Given(/^there are crashes for the last three weeks$/, async function () {
  let ymds = _.range(1, 6).map((i) => { return moment().subtract(i, 'days').format('YYYY-MM-DD') })
  const sampleCrashes = await factory.buildMany('crash', 5)
  for (let c of sampleCrashes) {
    c.contents.year_month_day = ymds.pop()
    c.contents.channel = 'stable'
    c.contents.platform = 'Win64'
    await db.Crash.query().insert(c)
  }
})

Then(/^I should see the total crashes for each day grouped by platform$/, async function () {

  const results = await db.Crash.query()
  const usageDataTable = await browser.getHTML('#usageDataTable')
  for (let row of results) {
    expect(usageDataTable).to.contain(row.contents.year_month_day)
    expect(usageDataTable).to.contain(db.Crash.reverseMapPlatformFilters([row.contents.platform]).pop())
  }
})
