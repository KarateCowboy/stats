/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const moment = require('moment')
const _ = require('lodash')
const main = require('../../src/index')

let params = {
  method : 'GET',
  url :  '/api/1/campaigns',
  auth: {
    strategy: 'session',
    credentials: {
      'user': 'admin',
      'password': process.env.ADMIN_PASSWORD
    }
  }
}

describe('Daily aggregate stats endpoints and sub-endpoints', async function () {
  let ymds, platforms, channels, ref, cutoffWoi
  before(async function () {
    ymds = _.range(0, 20).map((i) => {
      return {
        ymd: (moment().subtract(i, 'days').format('YYYY-MM-DD')),
        ref: 'none'
      }
    })
    platforms = ['winx64']
    channels = ['dev']
    ref = ['none']
    cutoffWoi = moment().subtract(1, 'week').startOf('week').add(1, 'days')
    await factory.createMany('fc_usage', ymds)
  })
  describe('1/dau', async function () {
    it('returns daily active user information', async function () {
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      // execution
      params.url = `/api/1/dau?platformFilter=${platforms.join(',')}&channelFilter=${channels.join(',')}&ref=${ref.join(',')}&wois=${cutoffWoi.format('YYYY-MM-DD')})}`
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      //validation
      expect(_.every(payload, (i) => { return moment(i.ymd).isSameOrAfter(cutoffWoi)})).to.equal(true)
    })
  })
})
