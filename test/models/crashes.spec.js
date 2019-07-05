/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const moment = require('moment')

describe('Crash model', async function () {
  let sampleCrash
  context('properties', async function () {
    beforeEach(async function () {
      sampleCrash = await factory.create('crash')
      sampleCrash = (await db.Crash.query().where('id', sampleCrash.id)).pop()
    })
    specify('id', async function () {
      expect(sampleCrash).to.have.property('id')
      expect(sampleCrash.id).to.match(/^[a-z0-9]{24,24}$/)
    })
    specify('contents', async function () {
      expect(sampleCrash).to.have.property('contents')
      expect(sampleCrash.contents).to.be.an('object')
    })
    specify('ts', async function () {
      expect(sampleCrash).to.have.property('ts')
    })
    context('deprecated attributes', async function () {
      specify('github_repo', async function () {
        expect(sampleCrash).to.not.have.property('github_repo')
      })
      specify('github_issue_number', async function () {
        expect(sampleCrash).to.not.have.property('github_issue_number')
      })
    })
  })
  describe('static methods', async function () {
    describe('#mapPlatformFilters', async function () {
      specify('linux to linux', async function () {
        const platformFilter = ['linux']
        let mappedFilter = db.Crash.mapPlatformFilters(platformFilter)
        expect(mappedFilter).to.have.members(['linux'])
      })
      specify('winx64-bc', async function () {
        const platformFilter = ['winx64-bc']
        let mappedFilter = db.Crash.mapPlatformFilters(platformFilter)
        expect(mappedFilter).to.have.members(['Win64'])
      })
      specify('winia32', async function () {
        const platformFilter = ['winia32']
        let mappedFilter = db.Crash.mapPlatformFilters(platformFilter)
        expect(mappedFilter).to.have.members(['Win32', 'win32'])
      })
      specify('osx-bc', async function () {
        const platformFilter = ['osx-bc']
        let mappedFilter = db.Crash.mapPlatformFilters(platformFilter)
        expect(mappedFilter).to.have.members(['OS X', 'darwin'])
      })
      specify('unknown', async function () {
        const platformFilter = ['unknown']
        let mappedFilter = db.Crash.mapPlatformFilters(platformFilter)
        expect(mappedFilter).to.have.members(['unknown'])
      })
    })
    describe('reusable queries', async function () {
      describe('totals', async function () {
        it('counts the number of crashes, grouped by platform and version', async function () {
          const sampleCrashes = await factory.buildMany('crash', 100)
          sampleCrashes.forEach((c) => {
            c.contents.platform = 'Win64'
            c.contents.year_month_day = moment().subtract(3, 'days').format('YYYY-MM-DD')
          })
          const sampleCrash = sampleCrashes[0]
          await factory.create('fc_usage', {
            platform: sampleCrash.canonPlatform,
            version: sampleCrash.contents._version,
            ymd: sampleCrash.contents.year_month_day
          })
          await Promise.all(sampleCrashes.map(async (c) => { await db.Crash.query().insert(c) }))

          await knex.raw('refresh materialized view dw.fc_crashes_dau_mv')

          const results = await db.Crash.totals()
          expect(results).to.have.property('length', 1)
          expect(results[0]).to.have.property('crashes', '100')
        })
      })
    })
  })
  describe('instance methods', async function () {
    describe('canonPlatform', async function () {
      specify('maps crash platform to canon stats platform', async function () {
        const sampleCrash = await factory.create('crash')
        const expectedPlatform = db.Crash.reverseMapPlatformFilters([sampleCrash.contents.platform]).pop()
        expect(sampleCrash.canonPlatform).to.equal(expectedPlatform)
      })
    })
    describe('version helper', async function () {
      specify('fetches the version from the crash contents', async function () {
        const sampleCrash = await factory.build('crash')
        expect(sampleCrash.version).to.equal(sampleCrash.contents._version)
      })
    })
  })
})
