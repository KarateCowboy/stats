/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const main = require('../../src/index')

describe('crud endpoints', async function () {

  describe('index/list', async function () {
    //TODO: fix this. it works in prod but not in the tests for some reason
    it('returns a bunch of referral codes', async function () {
      let params = {
        method: 'GET',
        url: '/api/1/referral_codes'
      }
      for (let i = 1; i <= 5; i++) {
        let ref_code = await factory.create('ref_code_pg')
      }
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', 5)
    })
  })
})
