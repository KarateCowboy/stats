const { expect } = require('chai')
const MenuConfig = require('../../src/ui/menu-config')
describe('MenuConfig', function () {
  let menuConfig
  beforeEach(function () {
    menuConfig = new MenuConfig()
  })
  specify('showControls', function () {
    expect(menuConfig).to.have.property('showControls', true)
  })
  specify('showShowToday', function () {
    expect(menuConfig).to.have.property('showShowToday', true)
  })
  specify('showRefFilter', function () {
    expect(menuConfig).to.have.property('showRefFilter', true)
  })
  specify('showDaysSelector', function () {
    expect(menuConfig).to.have.property('showDaysSelector', true)
  })
  specify('showCountryCodeFilter', function () {
    expect(menuConfig).to.have.property('showCountryCodeFilter', true)
  })
  specify('showWOISFilter', function () {
    expect(menuConfig).to.have.property('showWOISFilter', true)
  })
  describe('mappings', async function () {
    specify('exits', async function () {
      expect(menuConfig).to.have.property('mappings')
    })
    specify('controlSelectorMappings', function () {
      const mappings = {
        showControls: '#controls',
        showWOISFilter: '#woi_menu',
        showCountryCodeFilter: '#cc_menu',
        showDaysSelector: '#days-menu',
        showRefFilter: '#ref-filter'
      }
      expect(_.keys(menuConfig.mappings)).to.have.members(_.keys(mappings))
      expect(_.values(menuConfig.mappings)).to.have.members(_.values(mappings))
    })
  })
  /*
   * showShowToday
   * showRefFilter
   *
   */
})
