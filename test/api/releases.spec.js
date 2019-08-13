/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const _ = require('lodash')
const moment = require('moment')
const main = require('../../src/index')
let params = {
  method: 'GET',
  url: '/api/1/releases',
  auth: {
    strategy: 'session',
    credentials: {
      'user': 'admin',
      'password': process.env.ADMIN_PASSWORD
    }
  }
}

let server
describe('crud endpoints', async function () {
  let braveVersion, chromiumVersion
  before(async () => {
    server = await main.setup({ pg: pg_client, mg: mongo_client })
  })
  beforeEach(async function () {
    params.method = 'POST'
    braveVersion = '0.61.33'
    chromiumVersion = '76.12.3456.56'
    params.payload = {
      brave_version: braveVersion,
      chromium_version: chromiumVersion
    }
  })
  describe('post', async function () {
    it('requires a brave version and a chromium version', async function () {
      let response = await server.inject(params)
      const releases = await db.Release.query().select()
      expect(releases).to.have.property('length', 1)
      expect(releases[0]).to.have.property('brave_version', braveVersion)
      expect(releases[0]).to.have.property('chromium_version', chromiumVersion)
    })
    it('expects brave_version to be unique', async function () {
      let response = await server.inject(params)
      response = await server.inject(params)
      expect(response.statusCode).to.equal(500)
      expect(response.payload).to.contain('duplicate key value violates unique constraint')
    })

  })
})
