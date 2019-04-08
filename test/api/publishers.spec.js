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
  url: '/api/1/publishers/platforms',
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
  before(async () => {
    server = await main.setup({pg: pg_client, mg: mongo_client})
  })

  describe('index/list of platforms', async function () {
    it('returns a bunch of publisher platforms', async function () {
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', 3)
    })
  })
  describe('publisher totals', async function () {
    let days
    beforeEach(async function () {
      params.url = '/api/1/publishers/publisher_totals'
      days = _.range(0, 7).map((d) => { return {ymd: moment().subtract(d, 'days').format()}})
      await factory.createMany('publisher_signup_day', days)
    })
    it('returns a list of publisher totals', async function () {
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', days.length * 3)
    })
    it('works with the days parameter', async function () {
      const daysBackToSearch = 3
      params.url += '?days=' + daysBackToSearch
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', daysBackToSearch * 3)
    })
  })

})
