const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DevelopmentCrashes extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Crash Ratio by Platform and Version'
    this.subtitle = ''
    this.path = 'crash_ratio'
    this.menuTitle = 'Crash Ratios'
    this.menuId = 'crashRatio'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'crashRatioContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/crash_ratios?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  async handler (rows = []) {
    const crashVersionResults = await $.ajax('/api/1/crash_versions?' + $.param(this.app.pageState.standardParams()))
    this.crashVersionHandler(crashVersionResults)

    let table = $('#crash-ratio-table tbody')
    table.empty()
    rows.forEach(function (row) {
      let params = [row.platform, row.version, this.app.pageState.days].join('/')
      let buf = '<tr>'
      buf = buf + '<td class="text-right"><a href="#crash_ratio_list/' + params + '">' + round(row.crash_rate * 100, 1) + '</a></td>'
      buf = buf + '<td class="text-left">' + row.version + '</td>'
      buf = buf + '<td class="text-left">' + row.platform + '</td>'
      buf = buf + '<td class="text-right">' + row.crashes + '</td>'
      buf = buf + '<td class="text-right">' + row.total + '</td>'

      buf = buf + '</tr>'
      table.append(buf)
    })
    $(`#${this.contentTagId}`).show()
  }

  crashVersionHandler (rows) {
    let s = $('#crash-ratio-versions')
    s.empty()
    s.append('<option value="">All</option>')
    for(let row in rows){
      let buf = '<option value="' + row.version + '" '
      if (this.app.pageState.version === row.version) {
        buf = buf + 'SELECTED'
      }
      buf = buf + '>' + row.version + '</option>'
      s.append(buf)
    }
  }
}

module.exports = DevelopmentCrashes
