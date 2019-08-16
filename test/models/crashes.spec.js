/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* global specify, db, context, expect, beforeEach, factory, describe */

require('../test_helper')
const AWS = require('aws-sdk')

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
        expect(sampleCrash.version).to.equal(sampleCrash.contents.ver)
      })
    })
    context('elastic search', async function () {
      describe('writeToSearchIndex', async function () {
        it('writes the crash as an object in the search index', async function () {
          const elasticClient = { index: () => {} }
          const sampleCrash = await factory.build('crash')
          sinon.stub(elasticClient, 'index')
          await sampleCrash.writeToSearchIndex(elasticClient)
          expect(elasticClient.index.calledWith({
            index: 'crashes',
            type: 'crash',
            id: sampleCrash.id,
            body: sampleCrash.toJSON()
          })).to.equal(true, 'expected elastic to index the crash')
        })
      })
    })
    describe('writeToAws', async function () {
      specify.skip('writes the crash to the bucket as an object', async function () {
        const S3 = new AWS.S3({})
        const sampleCrash = await factory.build('crash')
        try {
          await sampleCrash.writeToAws(S3, 'test-crash-bucket')
        } catch (e) {
          console.log(e.message)
          throw e
        }
        const wasCalled = S3.putObject.calledWith({
          Bucket: 'test-crash-bucket',
          Key: sampleCrash.id,
          Body: sampleCrash.toJSON()
        })
        expect(wasCalled).to.equal(true, 'S3 should have received putObject with crash params')
      })
    })
  })
  describe('relations', async function () {
    specify('belongs to a release', async function () {
      const release = await factory.create('release')
      let crash = await factory.create('linux-crash')
      await release.$relatedQuery('crashes').relate(crash)
      crash = (await db.Crash.query().select('*'))[0]
      const fetchedRelease = await crash.$relatedQuery('release')
      expect(fetchedRelease).to.have.property('id', release.id)
    })
  })
})
