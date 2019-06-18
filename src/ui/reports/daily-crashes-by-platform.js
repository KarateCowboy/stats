const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyCrashesByPlatform extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Crashes by Platform'
    this.subtitle = ''
    this.path = 'crashes_platform'
    this.menuTitle = 'Daily Crashes by Platform'
    this.menuId = 'crashes'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showMobile = false
    this.menuConfig.showMuon = false
    this.menuConfig.showRefFilter = false
  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/dc_platform?' + $.param(this.app.pageState.standardParams()))
      this.handler(results.rows)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e)
    }
  }

  handler (rows = []) {
    let handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})
    handler(rows)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyCrashesByPlatform
