const $ =  require('jquery')
const BaseReportComponent = require('../base-report-component')
const _ = require('lodash')

class DailyNewUsers extends BaseReportComponent {
  constructor () {
    super()
    this.reportContent = `<marquee> this is a daily new users report </marquee>`
    this.menuId = 'dailyNewUsers'
    this.menuTitle = 'Daily New Users - DNU'
    this.title = 'Daily New Users (DNU)'
    this.subtitle = ''
    this.path = 'daily_new_users'
    this.contentTagId = 'usageContent'
    this.csvFilename = 'daily-new-users'
    this.csvDownloadable = true
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever () {
    const data = await $.ajax('/api/1/daily_new_users?' + $.param(this.app.pageState.standardParams()))
    data.forEach((row) => { row.platform = 'All' })
    this.handler(data)
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', { pivot: true })
    const resultData = handler(data)
    this.csvData = resultData.csv
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyNewUsers
