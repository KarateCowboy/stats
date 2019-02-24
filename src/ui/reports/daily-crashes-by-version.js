const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyCrashesByVersion extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Crashes by Version'
    this.subtitle = ''
    this.path = 'crashes_platform_version'
    this.menuTitle = 'Daily Crashes by Version'
    this.menuId = 'crashesVersion'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/dc_platform_version?' + $.param(this.app.pageState.standardParams()))
      this.handler(results.rows)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (rows = []) {
    let handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label', pivot: true})
    handler(rows)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyCrashesByVersion
