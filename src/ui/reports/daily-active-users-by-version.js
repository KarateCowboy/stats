const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyActiveUsersByVersion extends BaseReportComponent {
  constructor() {
    super()
    this.title = 'Daily Active Users by Version (DAU)'
    this.subtitle = ''
    this.path = 'versions'
    this.menuTitle = 'Daily Active Users by Version - DAU'
    this.menuId = 'versions'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever() {
    let results
    try {
      results = await $.ajax('/api/1/versions?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'version', 'Date', 'Version', {
      colourBy: 'index',
      pivot: true
    })
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyActiveUsersByVersion