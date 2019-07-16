/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const _ = require('lodash')
const main = require('../../src/index')
let params = {
  method : 'GET',
  url :  '/api/1/versions',
  auth: {
    strategy: 'session',
    credentials: {
      'user': 'admin',
      'password': process.env.ADMIN_PASSWORD
    }
  }
}

describe('crud endpoints', async function () {

  describe('index/list', async function () {
    it('returns a bunch of versions', async function () {
      await factory.createMany('version', 7)
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', 7)
    })
  })
})
