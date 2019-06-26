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
      url: '',
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
    beforeEach(async function () {
      params.url = '/api/1/dc_platform'
    })
    it('filters out muon crashes', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['muon-version'] = '1.2.3'
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload).to.have.property('length', 0)
    })
    it('returns a bunch of crash counts', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents.channel = 'stable'
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const platforms = db.Crash.reverseMapPlatformFilters(_.uniq(sampleCrashes.map(c => c.contents.platform))).sort()
      const returnedPlatforms = payload.map(r => r.platform).sort()
      expect(returnedPlatforms).to.have.members(_.uniq(platforms))
      const totalSum = payload.reduce((acc, val) => {
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
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      params.url += `?channelFilter=${channelFilter}`

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const expectedTotal = sampleCrashes.filter((i) => { return i.contents.channel === channelFilter }).length
      const totalFromPayload = payload.reduce((acc, val) => {
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
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      params.url += `?platformFilter=${platformFilter}`

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const expectedRowCount = sampleCrashes.filter((c) => { return db.Crash.reverseMapPlatformFilters([c.contents.platform]).includes(platformFilter) }).length
      expect(payload[0]).to.have.property('count', expectedRowCount.toString())
    })
  })
  describe('crash_versions', async function () {
    beforeEach(async function () {
      params.url = '/api/1/crash_versions?days=30'
    })
    it('returns all the varios versions', async function () {
      const crashes = await factory.buildMany('crash', 5)
      crashes.forEach(async (c) => {
        let version = `${_.random(1, 9)}.${_.random(1, 9)}.${_.random(1, 9)}`
        c.contents._version = version
        await db.Crash.query().insert(c)
      })
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = _.sortBy(JSON.parse(response.payload), 'name')
      expect(payload).to.have.property('length', 5)
      const expectedVersions = crashes.map(c => c.contents._version).sort()
      expect(payload.map(r => r.version).sort()).to.have.members(expectedVersions)
    })
  })
  describe('crash_ratios', async function () {
    beforeEach(async function () {
      params.url = '/api/1/crash_ratios?days=30'
    })
    it('returns a successful response', async function () {
      let daysBackCount = 1
      const ymds = _.range(1, 21).map((d) => {
        return {
          ymd: moment().subtract(d, 'days').format('YYYY-MM-DD'),
          platform: 'winx64-bc'
        }
      })
      const usages = await factory.createMany('fc_usage', ymds)

      const sampleCrashes = []
      while (daysBackCount <= 20) {
        const crashesForDay = _.random(30, 70)
        let crashCount = 1
        while (crashCount <= crashesForDay) {
          let c = await factory.build('crash')
          c.contents.year_month_day = moment().subtract(daysBackCount, 'days').format('YYYY-MM-DD')
          c.contents.platform = 'Win64'
          c.contents.channel = 'stable'
          c.contents._version = _.first(usages).version
          sampleCrashes.push(c)
          crashCount++
        }
        daysBackCount++
      }
      await Promise.all(sampleCrashes.map(async (c) => {
        await db.Crash.query().insert(c)
      }))

      await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_crashes_dau_mv')
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      params.url += `&version=${sampleCrashes[0].contents._version}`
      let response = await server.inject(params)
      let payload = _.sortBy(JSON.parse(response.payload), 'name')

      expect(payload[0]).to.have.property('version', sampleCrashes[0].contents._version)
      expect(payload[0]).to.have.property('platform', sampleCrashes[0].canonPlatform)
      expect(payload[0]).to.have.property('total', usages.reduce((acc, val) => { return acc += val.total }, 0))
      expect(payload[0]).to.have.property('crashes', sampleCrashes.length)
      expect(payload[0]).to.have.property('crash_rate', payload[0].crashes / payload[0].total)
    })
  })
})
