const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DailyPublishers extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Publishers'
    this.subtitle = ''
    this.path = 'dailyPublishers'
    this.menuTitle = 'Daily Publishers'
    this.menuId = 'dailyPublishers'
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
      let publisherTotals = await $.ajax('/api/1/publishers/publisher_totals?' + $.param(this.app.pageState.standardParams()))
      this.handler(publisherTotals)
    } catch (e) {
      alert(`Error fetching data for ${this.title}. Please see browser console.`)
      console.log(e)
    }
  }

  handler (publisherTotals) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'verificationStatus', 'Date', 'stuff', {
      colourBy: 'hashedLabel',
      pivot: true,
      orderedColumns: [
        'KYC and uphold verified',
        'E-mail, channel, and basic uphold identity verified',
        'Verified e-mail with verified channel',
        'Verified e-mail'
      ]
    })
    handler(publisherTotals)

    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyPublishers
