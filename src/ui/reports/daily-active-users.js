const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyActiveUsers extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Active Users (DAU)'
    this.subtitle = ''
    this.path = 'usage_agg'
    this.menuTitle = 'Daily Active Users - DAU'
    this.menuId = 'usageAgg'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/dau?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyActiveUsers