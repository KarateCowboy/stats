/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const _ = require('lodash')
const moment = require('moment')
const main = require('../../src/index')
let params = {}

describe('crud endpoints', async function () {
  beforeEach(async function () {
    params = {
      method: 'GET',
      url: '/api/1/dc_platform',
      auth: {
        strategy: 'session',
        credentials: {
          'user': 'admin',
          'password': process.env.ADMIN_PASSWORD
        }
      }
    }
  })

  describe('dc_crash', async function () {
    it('filters out muon crashes', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['muon-version'] = '1.2.3'
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({pg: pg_client, mg: mongo_client})

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload.rows).to.have.property('length', 0)

    })
    it('returns a bunch of crash counts', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents.channel = 'stable'
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({pg: pg_client, mg: mongo_client})

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const platforms = db.Crash.reverseMapPlatformFilters(_.uniq(sampleCrashes.map(c => c.contents.platform))).sort()
      const returnedPlatforms = payload.rows.map(r => r.platform).sort()
      expect(returnedPlatforms).to.have.members(_.uniq(platforms))
      const totalSum = payload.rows.reduce((acc, val) => {
        acc += parseInt(val.count)
        return acc
      }, 0)
      expect(totalSum).to.equal(sampleCrashes.length)
    })
    it('filters by channel', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        await db.Crash.query().insert(c)
      }))
      const channelFilter = _.sample(sampleCrashes.map(c => c.contents.channel))
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      params.url += `?channelFilter=${channelFilter}`

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const expectedTotal = sampleCrashes.filter((i) => { return i.contents.channel === channelFilter}).length
      const totalFromPayload = payload.rows.reduce((acc, val) => {
        acc += parseInt(val.count)
        return acc
      }, 0)
      expect(totalFromPayload).to.equal(expectedTotal)
    })
    it('filters by platform', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents.channel = 'stable'
        await db.Crash.query().insert(c)
      }))

      let platformFilter = db.Crash.reverseMapPlatformFilters([sampleCrashes[0].contents.platform]).pop()
      const server = await main.setup({pg: pg_client, mg: mongo_client})
      params.url += `?platformFilter=${platformFilter}`

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const expectedRowCount = sampleCrashes.filter((c) => { return db.Crash.reverseMapPlatformFilters([c.contents.platform]).includes(platformFilter) }).length
      expect(payload.rows[0]).to.have.property('count', expectedRowCount.toString())
    })
  })
})
