module.exports = class MenuConfig {
  constructor () {
    this.showControls = true
    this.showShowToday = true
    this.showRefFilter = true
    this.showDaysSelector = true
    this.showCountryCodeFilter = true
    this.showWOISFilter = true
    this.showMobile = true
    this.showMuon = true
    this.showCore = true
    this.showPagination = false
    this.mappings = {
      showControls: '#controls',
      showWOISFilter: '#woi_menu',
      showCountryCodeFilter: '#cc_menu',
      showDaysSelector: '#days-menu',
      showRefFilter: '#ref-filter',
      showMobile: '#controls-mobile-menu-container',
      showMuon: '#controls-muon-menu-container',
      showPagination: '#controls-pagination'
    }
  }
}
