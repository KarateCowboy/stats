const {expect} = require('chai')
const PageState = require('../../src/ui/page-state')

describe('PageState', async function () {
  describe('#standardParams', async function () {
    context('properties', async function () {
      let standardParams
      beforeEach(function () {
        let pageState = new PageState()
        standardParams = pageState.standardParams()
      })
      specify('days', async function () {
        expect(standardParams).to.have.property('days', 14)
      })
      specify('platformFilter', async function () {
        expect(standardParams).to.have.property('platformFilter')
      })
      specify('channelFilter', async function () {
        expect(standardParams).to.have.property('channelFilter')
      })
      specify('version', async function () {
        expect(standardParams).to.have.property('version')
      })
      specify('ref', async function () {
        expect(standardParams).to.have.property('ref')
      })
      specify('wois', async function () {
        expect(standardParams).to.have.property('wois')
      })
      specify('countryCodes', async function () {
        expect(standardParams).to.have.property('countryCodes')
      })
    })
  })
  describe('#serializePlatformParams', async function () {
    let platformParams
    beforeEach(async function () {
      let pageState = new PageState()
      platformParams = pageState.serializePlatformParams()
    })
    specify('it contains the PageState')

  })
  context('properties', async function () {
    let pageState
    beforeEach(async function () {
      pageState = new PageState()
    })
    specify('currentlySelected', async function () {
      expect(pageState).to.have.property('currentlySelected', null)
    })
    specify('days', async function () {
      expect(pageState).to.have.property('days', 14)
    })
    specify('dayOptions', async function () {
      expect(pageState).to.have.property('dayOptions')
      expect(pageState.dayOptions).to.have.members([10000, 365, 120, 90, 60, 30, 14, 7])
    })
    specify('version', async function () {
      expect(pageState).to.have.property('version', null)
    })
    specify('ref', async function () {
      expect(pageState).to.have.property('ref')
      expect(pageState.ref).to.be.an('array')
    })
    specify('productPlatforms', async function () {
      expect(pageState).to.have.property('productPlatforms')
      expect(pageState.productPlatforms).to.have.property('muon')
      expect(pageState.productPlatforms).to.have.property('core')
      expect(pageState.productPlatforms).to.have.property('mobile')
      expect(pageState.productPlatforms.muon).to.have.members(['winx64', 'winia32', 'osx', 'linux'])
      expect(pageState.productPlatforms.core).to.have.members(['winx64-bc', 'winia32-bc', 'osx-bc', 'linux-bc'])
      expect(pageState.productPlatforms.mobile).to.have.members(['androidbrowser', 'ios', 'android'])
    })
    specify('platformFilter', async function () {
      let platformFilterKeys = {
        'osx': true,
        'winx64': true,
        'winia32': true,
        'linux': true,
        'ios': true,
        'android': false,
        'androidbrowser': true,
        'osx-bc': true,
        'winx64-bc': true,
        'winia32-bc': true,
        'linux-bc': true
      }
      expect(_.keys(pageState.platformFilter)).to.have.members(_.keys(platformFilterKeys))
      expect(_.values(pageState.platformFilter)).to.have.members(_.values(platformFilterKeys))
    })
    specify('channelFilter', async function () {
      let channelFilterKeys = {
        'dev': true,
        'beta': false,
        'nightly': false,
        'release': true
      }

      expect(_.keys(pageState.channelFilter)).to.have.members(_.keys(channelFilterKeys))
      expect(_.values(pageState.channelFilter)).to.have.members(_.values(channelFilterKeys))
    })
    specify('wois', async function () {
      expect(pageState).to.have.property('wois')
      expect(pageState.wois instanceof Array).to.equal(true, 'wois property should be an array, but was not')
    })
    specify('countryCodes', async function () {
      expect(pageState).to.have.property('countryCodes')
      expect(pageState.countryCodes instanceof Array).to.equal(true, 'countryCodes property should be an array, but was not')
    })
    context('deprecated', async function () {
      specify('campaigns', async function () {
        expect(pageState).to.not.have.property('campaigns')
      })
    })
  })
})
