const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const { round } = require('../builders')

class CrashRatiosPlatform extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Crash Ratio by Platform and Version'
    this.subtitle = ''
    this.path = 'crash_ratio_platform'
    this.menuTitle = 'Crash Ratios by Platform'
    this.menuId = 'crashRatioPlatform'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'crashRatioContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showRefFilter = false
    this.menuConfig.showMuon = false
    this.menuConfig.showMobile = false
  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/crash_ratios_platform?' + $.param(this.app.pageState.standardParams()))
      await this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e)
      console.log(e.message)
    }
  }

  async handler (rows = []) {
    let crashVersionResults = []
    try {
      crashVersionResults = await $.ajax('/api/1/releases')
      this.crashVersionHandler(crashVersionResults)
    } catch (e) {
      console.log(`Error fetching crash versions from API`)
      console.log(e)
    }

    let table = $('#crash-ratio-table tbody')
    table.empty()
    rows.forEach((row) => {
      let buf = '<tr>'
      buf = buf + `<td class="text-right"><a href="#crash_ratio_list/${row.version}/${row.platform}` + '">' + round(row.crash_rate * 100, 1) + '</a></td>'
      buf = buf + '<td class="text-left">' + row.version + '</td>'
      buf = buf + '<td class="text-left">' + row.chromium_version + '</td>'
      buf = buf + '<td class="text-left">' + row.platform + '</td>'
      buf = buf + '<td class="text-right">' + row.crashes + '</td>'
      buf = buf + '<td class="text-right">' + row.total + '</td>'

      buf = buf + '</tr>'
      table.append(buf)
    })
    $(`#${this.contentTagId}`).show()
    $('#crash-ratio-detail-table').hide()
  }

  crashVersionHandler (rows) {
    let s = $('#crash-ratio-versions')
    s.empty()
    s.append('<option value="">All</option>')
    for (let row of rows) {
      let buf = `<option value="${row.brave_version}" `
      if (this.app.pageState.version === row.brave_version) {
        buf = buf + 'SELECTED'
      }
      buf = buf + '>' + row.brave_version + '</option>'
      s.append(buf)
    }
  }
}

module.exports = CrashRatiosPlatform
