const $ =  require('jquery')
const BaseReportComponent = require('../base-report-component')
const _ = require('lodash')

class DailyNewUsersByPlatform extends BaseReportComponent {
  constructor () {
    super()
    this.reportContent = `<marquee> this is a daily new users report </marquee>`
    this.menuId = 'dailyNewPlatform'
    this.menuTitle = 'Daily New Users by Platform - DNU'
    this.title = 'Daily New Users by Platform (DNU)'
    this.subtitle = ''
    this.path = 'daily_new_platform'
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }
  async retriever () {
    const data = await $.ajax('/api/1/dau_platform_first?' + $.param(this.app.pageState.standardParams()))
    this.handler(data)
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label', pivot: true})
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
  

}

module.exports = DailyNewUsersByPlatform
