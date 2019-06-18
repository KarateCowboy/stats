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

Given(/^there is crash ratio data for the last forty days$/, async function () {
  let daysBack = 0
  let crashes
  while (daysBack <= 60) {
    crashes = await factory.buildMany('crash', 60)
    const ymd = moment().subtract(daysBack, 'days').format('YYYY-MM-DD')
    crashes.forEach((c) => {
      c.contents.year_month_day = ymd
      c.contents.platform = 'Win64'
    })
    await Promise.all(crashes.map(async (c) => { await db.Crash.query().insert(c) }))
    await factory.create('fc_usage', {platform: 'winx64-bc', ymd: ymd, version: crashes[0].version})
    daysBack++
  }
  await factory.create('version', {num: crashes[0].version})
  await knex.raw('refresh materialized view dw.fc_crashes_dau_mv')
})

Given(/^I should see the crash ratios chart and table for the last forty days$/, async function () {

  const crashRatioChartIsVisible = await browser.isVisible('#crash-ratio-table')
  const crashRatioTableIsVisible = await browser.isVisible('#crash-ratio-table-detail')
  expect(crashRatioChartIsVisible).to.equal(true, 'crash ratio table should be visible')
  expect(crashRatioTableIsVisible).to.equal(true, 'crash ratio detail table should be visible')
})
