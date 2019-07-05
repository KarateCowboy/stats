const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyPublishersAggregated extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Publishers Aggregated'
    this.subtitle = ''
    this.path = 'dailyPublishersAgg'
    this.menuTitle = 'Daily Publishers Aggregated'
    this.menuId = 'dailyPublishersAgg'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showControls = true
    this.menuConfig.showShowToday = true
    this.menuConfig.showDaysSelector = true
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showRefFilter = false
  }

  async retriever () {
    try {
      let publisherTotals = await $.ajax('/api/1/publishers/daily_aggregate')
      this.handler(publisherTotals)
    } catch (e) {
      alert(`Error fetching data for ${this.title}. Please see browser console.`)
      console.log(e)
    }
  }

  handler (publisherTotals) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'verificationStatus', 'Date', 'stuff', {
      colourBy: 'hashedLabel',
      pivot: true
    })
    handler(publisherTotals)

    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyPublishersAggregated
