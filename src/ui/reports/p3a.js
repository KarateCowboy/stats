const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class P3A extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'P3A'
    this.subtitle = ''
    this.path = 'p3a'
    this.menuTitle = 'P3A'
    this.menuId = 'p3a'
    this.reportContent = ``
    this.contentTagId = 'usageContent'
    this.csvFilename = 'p3a'
    this.csvDownloadable = true
    this.menuConfig.showWOISFilter = true
    this.menuConfig.showCountryCodeFilter = true
    this.menuConfig.showMetricFilter = true
  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/p3a?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (data) {
    const { csv } = BaseReportComponent.buildSuccessHandler('wos', 'metric_value', 'Week of survey', 'Population', { colourBy: 'hashedLabel', pivot: true })(data)
    this.csvData = csv
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = P3A
