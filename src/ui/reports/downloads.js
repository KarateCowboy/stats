const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class Downloads extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Downloads'
    this.subtitle = 'By Day'
    this.path = 'downloads'
    this.menuTitle = 'Downloads'
    this.menuId = 'downloads'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/daily_downloads?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (rows) {
    let handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})
    handler(rows)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = Downloads
