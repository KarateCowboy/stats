/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const _ = require('lodash')
Then(/^there is recent data for daily publisher signup totals$/, async function () {
  const working_day = moment().subtract(5, 'days')
  while (working_day.isSameOrBefore(moment())) {
    const day = working_day.toDate()
    await factory.create('channel_total', {
      createdAt: day,
      updatedAt: day
    })
    await factory.create('publisher_signup_day', {
      createdAt: day,
      updatedAt: day
    })
    working_day.add(1, 'days')
  }
})
Then(/^there is recent data for aggregate publisher signups$/, async function () {
  const mArgs = _.range(1, 8).map((i) => { return {ymd: moment().subtract(i, 'days').format('YYYY-MM-DD')}})

  const publisherTotals = await factory.createMany('publisher_signup_day', mArgs)
  const campaign = await factory.create('campaign')
  const codeText = db.ReferralCode.randomCodeText()
  const referralCodes = await factory.create('ref_code_pg', {campaign_id: campaign.id, code_text: codeText})
})

Then(/^I should see the aggregate daily publisher signup data in the report$/, async function () {
  const contentTitle = await browser.getText('#contentTitle')
  expect(contentTitle).to.equal('Daily Publishers Aggregated')
  const usageContent = await browser.isVisible('#usageDataTable')
  expect(usageContent).to.equal(true, 'usageDataTable table should be visible on Daily Publishers Agg')
})

