const BaseReportComponent = require('../base-report-component')
const {submit}= require('../remote-job')

class DailyActiveUsersByCountry extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Active Users by Country (DAU)'
    this.subtitle = ''
    this.path = 'usageCountry'
    this.menuTitle = 'Daily Active Users by Country - DAU'
    this.menuId = 'usageCountry'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.csvFilename = 'daily-active-users-by-country'
    this.csvDownloadable = true
    this.menuConfig.showWOISFilter = true
    this.menuConfig.showCountryCodeFilter = true
  }

  async retriever () {
    const params = this.app.pageState.standardParams()
    let job = await submit('/api/1/dau_cc?' + $.param(params), 1000, 10 * 60 * 1000)
    job.on('complete', (results) => {
      this.handler(results)
    })
  }

  handler (data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'country_code', 'Date', 'Country', {colourBy: 'hashedLabel', pivot: true })
    this.csvData = handler(data).csv
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyActiveUsersByCountry
