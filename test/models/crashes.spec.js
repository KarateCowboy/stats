/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const _ = require('lodash')
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
  })
})
