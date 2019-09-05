const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const {submit}= require('../remote-job')

class DailyActiveUsers extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Active Users (DAU)'
    this.subtitle = ''
    this.path = 'usage_agg'
    this.menuTitle = 'Daily Active Users - DAU'
    this.menuId = 'usageAgg'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever () {
    const params = this.app.pageState.standardParams()
    let job = await submit('/api/1/dau?' + $.param(params), 1000, 10 * 60 * 1000)
    job.on('complete', (results) => {
      this.handler(results)
    })
  }

  handler (data) {
    const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})
    handler(data)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DailyActiveUsers
