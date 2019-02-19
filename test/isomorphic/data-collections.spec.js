require('../test_helper')
const _ = require('lodash')

describe('data collections', async function () {
  describe('Countries', async function () {
    it('contains a collection of region objects', async function () {
      const countries = require('../../src/isomorphic/countries')
      expect(_.every(countries, (i) => { return _.isString(i.id) && _.isString(i.label) && _.isArray(i.subitems) && i.subitems.length > 0 }))
    })
  })
  describe('WOI - Weeks of install', async function () {
    const wois = require('../../src/isomorphic/wois')
    it('returns a bunch of WOI categories', async function () {
      const results = wois()
      expect(results).to.be.an('array')
      expect(_.every(results, (i) => { return _.isString(i.id) && _.isString(i.label) && _.isArray(i.subitems) && i.subitems.length > 0 })).to.equal(true)
    })
    specify('containing weeks with id of format YYYY-MM-DD', async function () {
      const results = wois()
      const subitems = _.flatten(results.map(i => i.subitems))
      expect(_.every(subitems, (i) => { return i.id.match(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/) })).to.equal(true)
    })
  })
})