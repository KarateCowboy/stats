/* global describe, specify, expect, db, factory, beforeEach, context */
require('../test_helper')
const _ = require('lodash')

describe('Release model', async function () {
  describe('properties', async function () {
    let release
    beforeEach(async function () {
      release = await factory.build('release')
      await db.Release.query().insert(release)
      release = (await db.Release.query().select())[0]
    })
    specify('chromium_version', async function () {
      expect(release).to.have.property('chromiumVersion')
      expect(release.chromiumVersion).to.be.a('string')
    })
    specify('brave_version', async function () {
      expect(release).to.have.property('braveVersion')
      expect(release.brave_version).to.be.a('string')
    })
    specify('uses_hybrid_format', async function () {
      expect(release).to.have.property('usesHybridFormat')
      expect(release.usesHybridFormat).to.be.a('boolean')
    })
  })
  describe('relations', async function () {
    specify('has many crashes', async function () {
      // setup
      const release = await factory.create('release')
      await db.Release.query().insert(release)
      const crash = await factory.build('linux-crash')
      crash.contents.ver = release.chromium_version
      const secondCrash = await factory.build('linux-crash')
      crash.contents.ver = release.chromium_version

      await db.Crash.query().insert([crash, secondCrash])
      await release.$relatedQuery('crashes').relate([crash, secondCrash])

      // execution
      const fetchedRelease = (await db.Release.query().where({ id: release.id }).eager('crashes'))[0]
      // validation
      expect(fetchedRelease.crashes.map(c => c.id)).to.have.members([crash.id, secondCrash.id])
    })
    specify('has many usage summaries', async function () {
      // setup
      const release = await factory.create('release')
      await db.Release.query().insert(release)

      const usageSummary = await factory.build('linux-core-fcusage')
      await db.UsageSummary.query().insert(usageSummary)

      await release.$relatedQuery('usageSummaries').relate([usageSummary])

      // exec
      const fetchedRelease = (await db.Release.query().where({ id: release.id }).eager('usageSummaries'))[0]
      expect(fetchedRelease.usageSummaries[0]).to.have.property('id', usageSummary.id)
    })
  })
  describe('isHybridFormat', async function () {
    specify('returns true for 2 digit BUILD segment in chromium_version', async function () {
      const release = await factory.build('release')
      release.chromiumVersion = '12.34.56.78'
      expect(release.isHybridFormat()).to.equal(true)
    })
    specify('returns false for 4 digit BUILD segment in chromium_version', async function () {
      const release = await factory.build('release')
      release.chromiumVersion = '12.34.5678.90'
      expect(release.isHybridFormat()).to.equal(false)
    })
  })
  describe('before CREATE hooks', async function () {
    context('the chromium_version is a hybrid', async function () {
      specify('builds the brave_version based on the chromium_version value', async function () {
        const release = await factory.build('hybrid-release')
        await db.Release.query().insert(release)
        const fetchedRelease = (await db.Release.query().select())[0]
        const expectedBraveVersion = '0.' + release.chromiumVersion.match(/[0-9]{2,2}\.[0-9]{2,2}$/)[0]
        expect(fetchedRelease).to.have.property('braveVersion', expectedBraveVersion)
        expect(fetchedRelease).to.have.property('usesHybridFormat', true)
      })
    })
  })
  describe('static methods', async function () {
    describe('createFromCrashVersions', async function () {
      specify('creates a release for every chromium version found in crashes', async function () {
        await Promise.all(_.range(1, 100).map(async (i) => {
          const crashes = await factory.build('linux-crash')
          try {
            await db.Crash.query().insert(crashes)
          } catch (e) {
            _.noop()
          }
        }))
        await db.Release.createFromCrashVersions()
        const crashes = await db.Crash.query().select()
        const crashVers = crashes.map(c => c.contents.ver)
        const releases = await db.Release.query().select()
        expect(releases.length).to.equal(crashVers.length)
        expect(_.every(releases, (r) => { return r.isHybridFormat() })).to.equal(true, 'all releases should use the hybrid format and be marked as such')
      })
    })
  })
})
