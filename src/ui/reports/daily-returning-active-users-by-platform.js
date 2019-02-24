const $ = require('jquery')
const BaseReportComponent = require('../base-report-component')
const _ = require('lodash')

class DailyReturningActiveUsersByPlatform extends BaseReportComponent {
  constructor() {
    super()
    this.reportContent = `<marquee> this is a daily new users report </marquee>`
    this.menuId = 'usageReturning'
    this.menuTitle = 'Daily Returning Active Users by Platform - DAU'
    this.title = 'Daily Returning Active Users by Platform (DAU)'
    this.subtitle = ''
    this.path = 'usage_returning'
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }
  async retriever() {
    const data = await $.ajax('/api/1/dau_platform_minus_first?' + $.param(this.app.pageState.standardParams()))
    this.handler(data)
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label', pivot: true})
    handler(data)
    $(`#${this.contentTagId}`).show()
  }


}

module.exports = DailyReturningActiveUsersByPlatform
