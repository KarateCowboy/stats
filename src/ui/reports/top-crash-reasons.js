const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const {round} = require('../builders')

class TopCrashReasons extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Top Crashes by Platform and Version'
    this.subtitle = ''
    this.path = 'top_crashes'
    this.menuTitle = 'Top Crash Reasons'
    this.menuId = 'topCrashes'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'topCrashContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/crash_reports?' + $.param(this.app.pageState.standardParams()))
      console.log(results)
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (rows) {
    let table = $('#top-crash-table tbody')
    table.empty()
    const sum = _.reduce(rows, function (memo, row) { return memo + parseInt(row.total) }, 0)
    rows.forEach((row) => {
      let params = [row.platform, row.version, this.app.pageState.days, encodeURIComponent(row.crash_reason), row.cpu, encodeURIComponent(row.signature)].join('/')
      let buf = '<tr>'
      let percentage = round(row.total / sum * 100, 1)
      buf = buf + '<td class="text-right"><a href="#crash_list/' + params + '">' + row.total + '</a><br/><span class="ago">' + percentage + '%</span></td>'
      buf = buf + '<td class="text-left">' + row.version + '</td>'
      buf = buf + '<td class="text-left">' + row.canonical_platform + '</td>'
      buf = buf + '<td class="text-left">' + row.platform + ' ' + row.cpu + '</td>'
      buf = buf + '<td class="text-left">' + row.crash_reason + '<br/>' + row.signature + '</td>'
      buf = buf + '</tr>'
      table.append(buf)
    })
    $(`#${this.contentTagId}`).show()
    $('#crash-detail').hide()
    $('#crash-list-table').hide()
  }
}

module.exports = TopCrashReasons
