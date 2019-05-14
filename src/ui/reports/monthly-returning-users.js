const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class MonthlyReturningUsers extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Monthly Returning Users (MRU)'
    this.subtitle = ''
    this.path = 'usage_month_returning_agg'
    this.menuTitle = 'Monthly Returning Users - MRU'
    this.menuId = 'usageMonthReturningAgg'
    this.reportContent = `<marquee>Monthly Returning Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/mru?' + $.param(this.app.pageState.standardParams()))
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

module.exports = MonthlyReturningUsers
