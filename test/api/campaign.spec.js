/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const _ = require('lodash')
const main = require('../../src/index')

describe('crud endpoints', async function () {

  describe('index/list', async function () {
    it('returns a bunch of campaigns', async function () {
      let params = {
        method: 'GET',
        url: '/api/1/campaigns'
      }
      await factory.createMany('campaign', 7)
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', 7)
    })
    it('includes referral_codes', async function () {
      let params = {
        method: 'GET',
        url: '/api/1/campaigns'
      }
      const campaignOne = await factory.create('campaign')
      const refCodes = await factory.createMany('ref_code_pg', 2, {campaign_id: campaignOne.id})
      const campaignTwo = await factory.create('campaign')
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', 2)
      const fetchedCampaign = _.first(payload)
      expect(fetchedCampaign).to.have.property('referralCodes')
    })
  })
})
