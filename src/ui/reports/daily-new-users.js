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
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }
  async retriever () {
    const data = await $.ajax('/api/1/daily_new_users?' + $.param(this.app.pageState.standardParams()))
    this.handler(data)
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform')
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
  

}

module.exports = DailyNewUsers
