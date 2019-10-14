/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* global specify, db, context, it, expect, afterEach, beforeEach, factory, describe */

require('../test_helper')
const AWS = require('aws-sdk')
const moment = require('moment')

describe('Crash model', async function () {
  let sampleCrash
  context('properties', async function () {
    beforeEach(async function () {
      sampleCrash = await factory.build('crash')
      sampleCrash.updateSearchFields()
      await db.Crash.query().insert(sampleCrash)
      sampleCrash = (await db.Crash.query().select()).pop()
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
    specify('channel', async function () {
      expect(sampleCrash).to.have.property('channel')
    })
    specify('platform', async function () {
      expect(sampleCrash).to.have.property('platform')
    })
    specify('is_core', async function () {
      expect(sampleCrash).to.have.property('is_core')
    })
    specify('has_valid_version', async function () {
      expect(sampleCrash).to.have.property('has_valid_version')
    })
    specify('ymd', async function () {
      expect(sampleCrash).to.have.property('ymd')
    })
    specify('updated_at', async function () {
      expect(sampleCrash).to.have.property('updated_at', null)
    })
    specify('version', async function () {
      expect(sampleCrash).to.have.property('version')
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
  describe('hooks', async function () {
    context('beforeUpdate', async function () {
      it('changes the updated_at value', async function () {
        await factory.create('crash')
        let crash = (await db.Crash.query().select()).pop()
        expect(crash).to.have.property('updated_at', null)
        crash.contents.channel = 'release'
        await db.Crash.query().update(crash)
        crash = (await db.Crash.query().select()).pop()
        expect(crash.updated_at).to.be.a('date')
        expect(crash).to.have.property('channel', 'release')
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
    describe('.updateSearchFields', async function () {
      let sampleCrash
      beforeEach(async function () {
        sampleCrash = await factory.build('crash')
      })
      specify('ymd', async function () {
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('ymd', moment(sampleCrash.contents.year_month_day).format('YYYY-MM-DD'))
      })
      context('platform', async function () {
        specify('os x', async function () {
          sampleCrash.contents.platform = 'osx'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'osx-bc')

          sampleCrash.contents.platform = 'darwin'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'osx-bc')

          sampleCrash.contents.platform = 'OSX'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'osx-bc')

          sampleCrash.contents.platform = 'OS X'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'osx-bc')
        })
        specify('windows 64 bit', async function () {
          sampleCrash.contents.platform = 'Win64'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'winx64-bc')
        })
        specify('windows 32 bit', async function () {
          sampleCrash.contents.platform = 'Win32'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'winia32-bc')
        })
        specify('linux', async function () {
          sampleCrash.contents.platform = 'linux'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('platform', 'linux-bc')
        })
      })
      context('is_core', async function () {
        specify('is_core', async function () {
          sampleCrash.contents.ver = '70.33.11'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('is_core', true)
          sampleCrash.contents.ver = '69.09.01'
          sampleCrash.updateSearchFields()
          expect(sampleCrash).to.have.property('is_core', false)
        })
      })
      specify('has_valid_version', async function () {
        sampleCrash.contents.ver = '69.11.01'
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('has_valid_version', false)

        sampleCrash.contents.ver = '71.33.11'
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('has_valid_version', true)
      })
      specify('channel', async function () {
        sampleCrash.contents.channel = ''
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('channel', 'release')

        sampleCrash.contents.channel = null
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('channel', 'release')

        sampleCrash.contents.channel = undefined
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('channel', 'release')

        sampleCrash.contents.channel = 'dev'
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('channel', 'dev')
      })
      specify('version', async function () {
        sampleCrash.updateSearchFields()
        expect(sampleCrash).to.have.property('version', sampleCrash.contents.ver)
      })
      specify('returns an object containing the derived values', async function () {
        const returned = sampleCrash.updateSearchFields()
        expect(returned).to.have.property('ymd', sampleCrash.ymd)
        expect(returned).to.have.property('platform', sampleCrash.platform)
        expect(returned).to.have.property('is_core', sampleCrash.is_core)
        expect(returned).to.have.property('has_valid_version', sampleCrash.has_valid_version)
        expect(returned).to.have.property('channel', sampleCrash.channel)
        expect(returned).to.have.property('version', sampleCrash.version)
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
