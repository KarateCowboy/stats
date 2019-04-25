const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class MonthlyActiveUsers extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Monthly Active Users (MAU)'
    this.subtitle = ''
    this.path = 'usage_month_agg'
    this.menuTitle = 'Monthly Active Users - MAU'
    this.menuId = 'usageMonthAgg'
    this.reportContent = `<marquee>Monthly Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/mau?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {
      colourBy: 'label',
      growth_rate: true
    })
    handler(data)
    $(`#${this.contentTagId}`).show()
    $('#usageDataTable tbody').show()
  }
}

module.exports = MonthlyActiveUsers