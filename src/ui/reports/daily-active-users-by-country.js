const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
class DailyActiveUsersByCountry extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Active Users by Country (DAU)'
    this.subtitle = ''
    this.path = 'usageCountry'
    this.menuTitle = 'Daily Active Users by Country - DAU'
    this.menuId = 'usageCountry'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/dau_country?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'country_code', 'Date', 'Country', {colourBy: 'hashedLabel', pivot: true })
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyActiveUsersByCountry
