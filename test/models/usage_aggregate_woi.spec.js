/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const TestHelper = require('../test_helper').TestHelper
const UsageAggregateWOI = require('../../src/models/usage_aggregate_woi').UsageAggregateUtil

let test_helper
before(async function () {
  test_helper = new TestHelper()
  await test_helper.setup()
  await test_helper.truncate()
})
after(async function () {
  await test_helper.tear_down()
})
describe('UsageAggregateUtil', async function () {
  describe('#is_valid', async function () {
    it('requires a correctly formatted _id.woi', async function () {
      const invalid_woi = await factory.attrs('ios_usage_aggregate_woi')
      invalid_woi._id.woi = '2018-1-1'
      expect(UsageAggregateWOI.is_valid(invalid_woi)).to.equal(false)
      const valid_woi = await factory.attrs('ios_usage_aggregate_woi')
      const is_valid = UsageAggregateWOI.is_valid(valid_woi)
      expect(is_valid).to.equal(true)
    })
    it('requires a count number', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      delete ios_usage_agg_woi.count
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(false)
      ios_usage_agg_woi.count = 0
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(false)
      ios_usage_agg_woi.count = 3
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
    })
    it('requires a correctly formatted ymd date', async function () {
      const invalid_ymd = await factory.attrs('ios_usage_aggregate_woi')
      invalid_ymd._id.ymd = '2018-1-1'
      expect(UsageAggregateWOI.is_valid(invalid_ymd)).to.equal(false)
      const valid_ymd = await factory.attrs('ios_usage_aggregate_woi')
      const is_valid = UsageAggregateWOI.is_valid(valid_ymd)
      expect(is_valid).to.equal(true)
      const missing_ymd = await factory.attrs('ios_usage_aggregate_woi')
      delete missing_ymd._id.ymd
      expect(UsageAggregateWOI.is_valid(missing_ymd)).to.equal(false)
    })
    it('requires the platform', async function () {
      const usage_aggregate_woi = await factory.attrs('ios_usage_aggregate_woi')
      usage_aggregate_woi._id.platform = 'ubuntu'
      expect(UsageAggregateWOI.is_valid(usage_aggregate_woi)).to.equal(false)

      const valid_platforms = ['ios', 'androidbrowser', 'unknown', 'osx', 'winia32', 'winx64', 'linux']
      for (let platform of valid_platforms) {
        usage_aggregate_woi._id.platform = platform
        expect(UsageAggregateWOI.is_valid(usage_aggregate_woi)).to.equal(true)
      }
    })
    it('requires a correctly formatted version', async function () {
      const invalid_version = await factory.attrs('ios_usage_aggregate_woi')
      invalid_version._id.version = '1.3'
      expect(UsageAggregateWOI.is_valid(invalid_version)).to.equal(false)

      const valid_version = await factory.attrs('ios_usage_aggregate_woi')
      valid_version._id.version = '1.3.1'
      expect(UsageAggregateWOI.is_valid(valid_version)).to.equal(true)
    })
    it('requires the first_time boolean', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      ios_usage_agg_woi._id.first_time = '1.3'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(false)
      ios_usage_agg_woi._id.first_time = false
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
    })
    it('requires a valid channel', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      ios_usage_agg_woi._id.channel = 'cartoon network'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(false)
      ios_usage_agg_woi._id.channel = 'beta'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
      ios_usage_agg_woi._id.channel = 'stable'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
      ios_usage_agg_woi._id.channel = 'developer'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
      ios_usage_agg_woi._id.channel = 'nightly'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
      ios_usage_agg_woi._id.channel = 'dev'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
    })
    it('requires the ymd to be on or after the woi', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      ios_usage_agg_woi._id.woi = '2018-03-01'
      ios_usage_agg_woi._id.ymd = '2018-02-28'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(false)
      ios_usage_agg_woi._id.ymd = '2018-03-02'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
      ios_usage_agg_woi._id.ymd = '2018-03-01'
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
    })
    it('requires key but can be null ', async function () {
      const ios_usage_agg_woi = await factory.attrs('ios_usage_aggregate_woi')
      ios_usage_agg_woi._id.ref = null
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
      delete ios_usage_agg_woi._id.ref
      expect(UsageAggregateWOI.is_valid(ios_usage_agg_woi)).to.equal(true)
    })
  })
  describe('#scrub', function () {
    it('fixes an incorrectly formatted woi', async function () {
      const bad_woi = await factory.attrs('ios_usage_aggregate_woi')
      bad_woi._id.woi = '2018-1-5'
      const correctResult = '2018-01-05'
      const result = UsageAggregateWOI.scrub(bad_woi)
      expect(result._id.woi).to.equal(correctResult)
    })
    it('fixes a bad version', async function () {
      const bad_version = await factory.attrs('ios_usage_aggregate_woi')
      bad_version._id.version = '1.2'
      const result = UsageAggregateWOI.scrub(bad_version)
      expect(result._id.version).to.equal('1.2.0')
    })
    it('fixes an incorrectly formatted ymd', async function () {
      const bad_ymd = await factory.attrs('ios_usage_aggregate_woi')
      bad_ymd._id.ymd = '2018-1-1'
      const result = UsageAggregateWOI.scrub(bad_ymd)
      expect(result._id.ymd).to.equal('2018-01-01')
    })
  })
  describe('#transfer_to_retention_woi', async function () {
    it('takes a collection of usage_aggregate_woi objects and moves it to the retention_woi table', async function () {
      const usages = []
      for (let i = 1; i <= 25; i++) {
        let usage = await factory.attrs('android_usage_aggregate_woi')
        await mongo_client.collection('android_usage_aggregate_woi').insert(usage)
        usages.push(usage)
        await UsageAggregateWOI.transfer_to_retention_woi(usage)
        const retention_woi = await knex('dw.fc_retention_woi').where('ref', usage._id.ref)
        expect(retention_woi[0]).to.have.property('total', usage.usages.length.toString())
      }
    })
  })
})
