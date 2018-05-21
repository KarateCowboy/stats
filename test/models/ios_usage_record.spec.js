/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const IosUsageRecord = require('../../src/models/ios_usage_record')
const moment = require('moment')
const TestHelper = require('../test_helper').TestHelper

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
describe('#woiFromYMD', function () {
  it('returns the prior monday', async function () {
    const bad_woi = await factory.build('ios_usage_bad_woi')
    const ymd = bad_woi.year_month_day
    const woi = IosUsageRecord.woiFromYMD(ymd)
    const correctResult = moment(ymd).startOf('week').add(1, 'days').format('YYYY-MM-DD')
    expect(correctResult).to.equal(woi)
  })
})

