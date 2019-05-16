const $ =  require('jquery')
const BaseReportComponent = require('../base-report-component')
const _ = require('lodash')

class DailyNewUsersByCampaign extends BaseReportComponent {
  constructor () {
    super()
    this.reportContent = `<marquee> this is a daily new users report </marquee>`
    this.menuId = 'dnuCampaign'
    this.menuTitle = 'Daily New Users by Campaign - DNU'
    this.title = 'Daily New Users by Campaign (DNU)'
    this.subtitle = ''
    this.path = 'dnuCampaign'
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showRefFilter = false

  }
  async retriever () {
    const data = await $.ajax('/api/1/dnu_campaign?' + $.param(this.app.pageState.standardParams()))
    this.handler(data)
  }

  handler(data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'campaign', 'Date', 'campaign', {colourBy: 'hashedLabel', pivot: true, chartType: 'bar', datasetOrdering: this.forceOrganicOrdering })
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
  

}

module.exports = DailyNewUsersByCampaign
