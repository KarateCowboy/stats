/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const moment = require('moment')
const TestHelper = require('../test_helper').TestHelper
const WeekOfInstall = require('../../src/models/retention').WeekOfInstall
const UsageAggregateWOI = require('../../src/models/usage_aggregate_woi').UsageAggregateUtil
const main = require('../../src/index')
const _ = require('underscore')

let test_helper
before(async function () {
  test_helper = new TestHelper()
  await test_helper.setup()
  await test_helper.truncate()

})
after(async function () {
  await test_helper.tear_down()
})

describe('crud endpoints', async function () {
  describe('index/list', async function () {
    it('returns a bunch of referral codes', async function () {
      let params = {
        method: 'GET',
        url: '/api/1/referral_codes'
      }
      for (let i = 1; i <= 5; i++) {
        let ref_code = await factory.build('referral_code')
        await ref_code.save()
      }
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length',5)
    })

  })
})
