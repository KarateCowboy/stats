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
  }

  async retriever () {
    try {
      let publisherTotals = await $.ajax('/api/1/publishers/publisher_totals')
      this.handler(publisherTotals)
    } catch (e) {
      alert(`Error fetching data for ${this.title}. Please see browser console.`)
      console.log(e)
    }
  }

  handler (publisherTotals) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'country_code', 'Date', 'Country', {
      colourBy: 'hashedLabel',
      pivot: true
    })

    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyPublishers
