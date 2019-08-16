/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global beforeEach, before, db, describe, expect, factory, it, pg_client, mongo_client, specify */

require('../test_helper')
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
      await server.inject(params)
      const releases = await db.Release.query().select()
      expect(releases).to.have.property('length', 1)
      expect(releases[0]).to.have.property('brave_version', braveVersion)
      expect(releases[0]).to.have.property('chromium_version', chromiumVersion)
    })
  })
  describe('get', async function () {
    beforeEach(async function () {
      params.method = 'GET'
      params.url = '/api/1/releases'
    })

    specify('does not include versions without crashes', async function () {
      const releaseWithCrashes = await factory.create('release-with-crashes')
      const crashes = await db.Crash.query().select()
      await releaseWithCrashes.$relatedQuery('crashes').relate(crashes)

      const releaseNoCrashes = await factory.create('release')

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload).to.be.an('array')
      expect(payload).to.have.property('length', 1)
      expect(payload[0]).to.have.property('brave_version', releaseWithCrashes.braveVersion)
    })
  })
})
