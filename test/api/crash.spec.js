/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global describe, specify, beforeEach, it, context, expect, factory, db, pg_client, mongo_client, knex */

require('../test_helper')
const _ = require('lodash')
const moment = require('moment')
const main = require('../../src/index')
const { ref } = require('objection')
let params = {}

describe('Crashes API', async function () {
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

  describe('dc_platform', async function () {
    beforeEach(async function () {
      params.url = '/api/1/dc_platform'
    })
    it('filters out muon crashes', async function () {
      const sampleCrashes = await factory.buildMany('crash', 7)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['muon-version'] = '0.22.3'
        c.contents.ver = '0.22.33'
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload).to.have.property('length', 0)
    })
    it('returns a bunch of crash counts', async function () {
      const sampleCrashes = await factory.buildMany('linux-crash', 70)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents.channel = 'stable'
        c.contents.ver = '76.11.11'
        c.updateSearchFields()
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      const returnedPlatforms = payload.map(r => r.platform).sort()
      expect(returnedPlatforms).to.have.members(['linux-bc'])
      const totalSum = payload.reduce((acc, val) => {
        acc += parseInt(val.count)
        return acc
      }, 0)
      expect(totalSum).to.equal(sampleCrashes.length)
    })
    it('filters by channel', async function () {
      const sampleCrashes = await factory.buildMany('linux-crash', 70)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.ver = '75.11.11'
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
    context('filters each platform correctly', async function () {
      let server
      beforeEach(async function () {
        server = await main.setup({ pg: pg_client, mg: mongo_client })
        const linCrash = await factory.build('linux-crash')
        const win64Crash = await factory.build('win64-crash')
        const win32Crash = await factory.build('win32-crash')
        const osxCrash = await factory.build('osx-crash')
        const allCrashes = [linCrash, win32Crash, win64Crash, osxCrash]
        allCrashes.forEach((c) => {
          c.contents.ver = '76.11.11'
        })
        await db.Crash.query().insert(allCrashes)
      })
      specify('winx64-bc', async function () {
        params.url += '?platformFilter=winx64-bc'
        let response = await server.inject(params)
        let payload = JSON.parse(response.payload)
        expect(payload).to.have.property('length', 1)
      })
      specify('linux-bc', async function () {
        params.url += `?platformFilter=linux-bc`
        let response = await server.inject(params)
        let payload = JSON.parse(response.payload)
        expect(payload).to.have.property('length', 1)
        expect(payload[0]).to.have.property('platform', 'linux-bc')
      })
      specify('winia32-bc', async function () {
        // winia32-bc
        params.url += '?platformFilter=winia32-bc'
        let response = await server.inject(params)
        let payload = JSON.parse(response.payload)
        expect(payload).to.have.property('length', 1)
      })
      specify('osx-bc', async function () {
        // osx-bc
        params.url += '?platformFilter=osx-bc'
        let response = await server.inject(params)
        let payload = JSON.parse(response.payload)
        expect(payload).to.have.property('length', 1)
      })
    })
  })

  describe('crash ratios', async function () {
    let sampleCrashes, server, release, usage
    let stableCrashes, stableRelease, stableUsage
    beforeEach(async function () {
      // setup
      usage = await factory.create('linux-core-fcusage', {
        total: 10000,
        ymd: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        channel: 'dev'
      })
      release = await factory.build('release')
      release.brave_version = usage.version
      await db.Release.query().insert(release)

      sampleCrashes = await factory.buildMany('linux-crash', 1000)
      sampleCrashes.forEach((c) => {
        c.contents.year_month_day = usage.ymd
        c.contents.ver = release.chromiumVersion
        c.contents.channel = usage.channel
      })

      await db.Crash.query().insert(sampleCrashes)

      stableUsage = await factory.create('linux-core-fcusage', {
        total: 10000,
        channel: 'stable',
        ymd: moment().subtract(2, 'days').format('YYYY-MM-DD')
      })

      stableRelease = await factory.build('release', { brave_version: stableUsage.version })
      await db.Release.query().insert(stableRelease)
      stableCrashes = await factory.buildMany('linux-crash', 500)

      stableCrashes.forEach((c) => {
        c.contents.year_month_day = stableUsage.ymd
        c.contents.ver = stableRelease.chromiumVersion
        c.contents.channel = stableUsage.channel
      })

      await db.Crash.query().insert(stableCrashes)

      await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_crashes_dau_mv')
      server = await main.setup({ pg: pg_client, mg: mongo_client })
    })
    context('by version', async function () {
      beforeEach(async function () {
        params.url = '/api/1/crash_ratios'
      })
      it('returns a successful response', async function () {
        params.url += `?version=${release.braveVersion}`
        // execution
        let response = await server.inject(params)
        let payload = _.sortBy(JSON.parse(response.payload), 'version')

        // validation
        expect(payload[0]).to.have.property('version', usage.version)
        expect(payload[0]).to.not.have.property('platform')
        expect(payload[0]).to.have.property('total', usage.total)
        expect(payload[0]).to.have.property('chromium_version', release.chromium_version)
        expect(payload[0]).to.have.property('crash_rate', payload[0].crashes / payload[0].total)
      })
    })
    context('by platform and version', async function () {
      beforeEach(async function () {
        params.url = '/api/1/crash_ratios_platform'
      })
      it('returns a successful response', async function () {
        params.url += `?version=${release.braveVersion}`
        // execution
        let response = await server.inject(params)
        let payload = _.sortBy(JSON.parse(response.payload), 'version')

        // validation
        expect(payload[0]).to.have.property('version', usage.version)
        expect(payload[0]).to.have.property('platform', usage.platform)
        expect(payload[0]).to.have.property('total', usage.total)
        expect(payload[0]).to.have.property('chromium_version', release.chromium_version)
        expect(payload[0]).to.have.property('crash_rate', payload[0].crashes / payload[0].total)
      })
      it('filters channels', async function () {
        params.url += `?channelFilter=stable`
        // execution
        let response = await server.inject(params)
        let payload = JSON.parse(response.payload)

        // validation
        expect(payload[0].crashes).to.equal(stableCrashes.length)
      })
      it('filters by version', async function () {
        params.url += `?version=${stableUsage.version}`
        // execution
        let response = await server.inject(params)
        let payload = JSON.parse(response.payload)

        // validation
        expect(payload[0].crashes).to.equal(stableCrashes.length)
        expect(payload).to.have.property('length', 1)
      })
    })
  })
  describe('crash_versions', async function () {
    beforeEach(async function () {
      params.url = '/api/1/crash_versions?days=30'
    })
    it('returns all the various versions', async function () {
      const crashes = await factory.buildMany('crash', 5)
      await Promise.all(crashes.map(async (c) => {
        let version = `${_.random(1, 9)}.${_.random(1, 9)}.${_.random(1, 9)}`
        c.contents._version = version
        await db.Crash.query().insert(c)
      }))
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = _.sortBy(JSON.parse(response.payload), 'name')
      expect(payload).to.have.property('length', 5)
      const expectedVersions = crashes.map(c => c.contents._version).sort()
      expect(payload.map(r => r.version).sort()).to.have.members(expectedVersions)
    })
  })
  describe('crash_reports', async function () {
    beforeEach(async function () {
      params.url = '/api/1/crash_reports'
    })
    specify('filters out muon crashes', async function () {
      const sampleCrashes = await factory.buildMany('crash', 17)
      await Promise.all(sampleCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['muon-version'] = '1.2.3'
        c.contents['_version'] = '0.23.1'
        c.contents['ver'] = '0.23.1'
        c.contents['platform'] = 'linux'
      }))
      await db.Crash.query().insert(sampleCrashes)
      await knex.raw('refresh materialized view dw.fc_crashes_mv')
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      params.url = '/api/1/crash_reports'
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload).to.have.property('length', 0)
    })
    specify('includes core crashes', async function () {
      const coreCrashes = await factory.buildMany('crash', 170)
      await Promise.all(coreCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['ver'] = '0.65.1'
        c.contents['platform'] = 'linux'
        await db.Crash.query().insert(c)
      }))
      const muonCrashes = await factory.buildMany('crash', 170)
      await Promise.all(muonCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['ver'] = '0.22.1'
        c.contents['platform'] = 'linux'
        await db.Crash.query().insert(c)
      }))

      await knex.raw('refresh materialized view dw.fc_crashes_mv')
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload).to.have.property('length', 6)
      expect(payload[0].version).to.equal('0.65.1')
    })
    it('filters channels correctly', async function () {
      const coreCrashes = await factory.buildMany('crash', 170)
      await Promise.all(coreCrashes.map(async (c) => {
        c.contents.year_month_day = moment().subtract(2, 'days').format('YYYY-MM-DD')
        c.contents['ver'] = '0.65.1.3'
        c.contents['platform'] = 'linux'
        await db.Crash.query().insert(c)
      }))
      await knex.raw('refresh materialized view dw.fc_crashes_mv')
      params.url += '?channelFilter=dev'
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)

      expect(payload).to.have.property('length', 1)
      expect(payload[0].channel).to.equal('dev')
    })
  })

  describe('crashes for ratio', async function () {
    let linuxUsage, release, crashes
    beforeEach(async function () {
      linuxUsage = await factory.create('linux-core-fcusage')
      release = await factory.create('release', { brave_version: linuxUsage.version })
      crashes = await factory.buildMany('linux-crash', 300)
      crashes.forEach((c) => {
        c.contents.year_month_day = linuxUsage.ymd
        c.contents.ver = release.chromiumVersion
        c.contents.platform = 'linux'
      })
      await db.Crash.query().insert(crashes)
      await release.$relatedQuery('crashes').relate(crashes)
      await factory.createMany('win64-crash', 200)

    })
    it('accepts version as a parameter', async function () {
      params.url = `/api/1/crash_range_crashes?version=${linuxUsage.version}`
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', crashes.length)
    })
    it('accepts platform as a parameter', async function () {
      params.url = `/api/1/crash_range_crashes?version=${linuxUsage.version}&platform=${linuxUsage.platform}`
      // make everything the same version, across platforms
      await db.Crash.query().update({ 'version': release.chromium_version, 'platform': release.platform }).whereNotNull('id')
      const server = await main.setup({ pg: pg_client, mg: mongo_client })

      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', crashes.length)
    })
    it('only returns crashes from the last sixty days', async function () {
      params.url = `/api/1/crash_range_crashes?version=${linuxUsage.version}`
      const oldCrashes = _.slice(crashes, 0, 10)
      await db.Crash.query().whereIn('id', oldCrashes.map(c => c.id)).delete()
      oldCrashes.forEach((c) => { c.contents.year_month_day = moment().subtract(90, 'days').format('YYYY-MM-DD')})
      await db.Crash.query().insert(oldCrashes)
      const server = await main.setup({ pg: pg_client, mg: mongo_client })
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      expect(payload).to.have.property('length', crashes.length - oldCrashes.length)
    })
  })
  describe('1/recent_crash_report_details', async function () {
    let winCrashes, linCrashes, osxCrashes, androidCrashes, allCrashes, server
    beforeEach(async function () {
      params.url = '/api/1/recent_crash_report_details'
      winCrashes = await factory.buildMany('win64-crash', 25)
      winCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
      linCrashes = await factory.buildMany('linux-crash', 25)
      linCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
      osxCrashes = await factory.buildMany('osx-crash', 25)
      osxCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
      androidCrashes = await factory.buildMany('android-crash', 25)
      androidCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
      allCrashes = _.flatten([winCrashes, linCrashes, osxCrashes, androidCrashes])
      allCrashes.forEach((c) => c.updateSearchFields())
      await db.Crash.query().insert(allCrashes)
      server = await main.setup({ pg: pg_client, mg: mongo_client })
    })
    specify('filters by channel', async function () {
      params.url += '?channelFilter=dev&ref=\'\'&wois=\'\''
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      const devCrashes = allCrashes.filter((c) => { return c.channel === 'dev'})
      expect(payload).to.have.property('length', devCrashes.length)
    })
    specify('filters by platform', async function () {
      params.url += '?platformFilter=winx64-bc&ref=\'\'&wois=\'\''
      let response = await server.inject(params)
      let payload = JSON.parse(response.payload)
      const winCrashes = allCrashes.filter((c) => { return c.platform === 'winx64-bc'})
      expect(payload).to.have.property('length', winCrashes.length)
    })
    specify('filters by date interval')
  })
})
