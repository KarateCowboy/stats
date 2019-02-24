module.exports = class MenuConfig {
  constructor () {
    this.showControls = true
    this.showShowToday = true
    this.showRefFilter = true
    this.showDaysSelector = true
    this.showCountryCodeFilter = true
    this.showWOISFilter = true
    this.mappings = {
      showControls: '#controls',
      showWOISFilter: '#woi_menu',
      showCountryCodeFilter: '#cc_menu',
      showDaysSelector: '#days-menu',
      showRefFilter: '#ref-filter'
    }
  }
}
