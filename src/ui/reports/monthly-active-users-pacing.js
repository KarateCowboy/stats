const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class MonthlyActiveUsersPacing extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Monthly Active Users (Pacing) (MAU)'
    this.subtitle = ''
    this.path = 'usage_month_pacing'
    this.menuTitle = 'Monthly Active Users - Pacing - MAU'
    this.menuId = 'usageMonthPacing'
    this.reportContent = `<marquee>Monthly Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.csvFilename = 'monthly-active-users-pacing'
    this.csvDownloadable = true
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/mau_pacing?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (data) {
    const handler = BaseReportComponent.buildSuccessHandler('day', 'month', 'Day', 'Month', {
      colourBy: 'hashedLabel',
      pivot: true,
      showTotalColumn: false,
      allowNaN: true
    })
    this.csvData = handler(data).csv
    $(`#${this.contentTagId}`).show()
    $('#usageDataTable tbody').show()
  }
}

module.exports = MonthlyActiveUsersPacing
