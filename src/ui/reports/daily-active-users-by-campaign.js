const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyActiveUsersByCampaign extends BaseReportComponent {
  constructor() {
    super()
    this.title = 'Daily Active Users by Campaign (DAU)'
    this.subtitle = ''
    this.path = 'dauCampaign'
    this.menuTitle = 'Daily Active Users by Campaign - DAU'
    this.menuId = 'dauCampaign'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever() {
    let results
    try {
      results = await $.ajax('/api/1/dau_campaign?' + $.param(this.app.pageState.standardParams()))
      console.log(`DAUCampaign results:`)
      console.log(results)
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler(data) {
    BaseReportComponent.buildSuccessHandler('ymd', 'campaign', 'Date', 'campaign', {
      colourBy: 'hashedLabel',
      pivot: true,
      chartType: 'bar',
      datasetOrdering: this.forceOrganicOrdering
    })(data)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyActiveUsersByCampaign