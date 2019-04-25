const $ = require('jquery')
const BaseReportComponent = require('../base-report-component')
const _ = require('lodash')

class DailyReturningUsersByCampaign extends BaseReportComponent {
  constructor() {
    super()
    this.reportContent = `<marquee> this is a daily new users report </marquee>`
    this.menuId = 'druCampaign'
    this.menuTitle = 'Daily Returning Users by Campaign - DRU'
    this.title = 'Daily Returning Users by Campaign (DRU)'
    this.subtitle = ''
    this.path = 'druCampaign'
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }
  async retriever() {
    const data = await $.ajax('/api/1/dru_campaign?' + $.param(this.app.pageState.standardParams()))
    this.handler(data)
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'campaign', 'Date', 'campaign', {
      colourBy: 'hashedLabel',
      pivot: true,
      chartType: 'bar',
      datasetOrdering: this.forceOrganicOrdering
    })
    handler(data.results)
    $(`#${this.contentTagId}`).show()
  }


}

module.exports = DailyReturningUsersByCampaign