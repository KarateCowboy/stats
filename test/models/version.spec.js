/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const _ = require('lodash')
const moment = require('moment')

describe('Version model', async function () {
  let sampleVersion
  context('properties', async function () {
    beforeEach(async function () {
      sampleVersion = await factory.create('version')
      sampleVersion = (await db.Version.query().where('id', sampleVersion.id)).pop()
    })
    specify('id', async function () {
      expect(sampleVersion).to.have.property('id')
      expect(sampleVersion.id).to.be.a('number')
    })
    specify('num', async function () {
      expect(sampleVersion).to.have.property('num')

    })

    specify('accepts development version numbers', async function() {
      const devVersionNumber = 'cc0ebadfd8950d1b5f454cb39c0c3a64028cc935'
      sampleVersion = await factory.attrs('version', { num: devVersionNumber})
      await db.Version.query().insert(sampleVersion)
    })
    specify('timestamps', async function () {
      expect(sampleVersion).to.have.property('created_at')
      expect(sampleVersion).to.have.property('updated_at')
    })
  })
  context('relation mappings', async function () {
    it('has many crashes', async function () {
      const sampleVersion = await factory.create('version')
      const associatedCrashes = await factory.buildMany('crash', 20)
      associatedCrashes.forEach((c) => { c.contents._version = sampleVersion.num })
      await db.Crash.query().insert(associatedCrashes)

      const anotherVersion = await factory.create('version')
      const unassociatedCrashes = await factory.buildMany('crash', 20)
      unassociatedCrashes.forEach((c) => { c.contents._version = anotherVersion.num })
      await db.Crash.query().insert(unassociatedCrashes)

      const foundCrashes = await sampleVersion.$relatedQuery('crashes')
      expect(foundCrashes.map(c => c.id).sort()).to.have.members(associatedCrashes.map(c => c.id).sort())
      expect(foundCrashes.map(c => c.id).sort()).to.not.have.members(unassociatedCrashes.map(c => c.id).sort())

    })
  })
})
