const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class DevelopmentCrashes extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Development Crash Reports'
    this.subtitle = 'Most recent development crashes'
    this.path = 'development_crashes'
    this.menuTitle = 'Development Crashes'
    this.menuId = 'developmentCrashes'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'developmentCrashContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/development_crash_report_details?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (crashes) {
    let table = $('#development-crash-list-table tbody')
    table.empty()
    _.each(crashes, function (crash) {
      let rowClass = ''
      let buf = '<tr class="' + rowClass + '">'
      buf = buf + '<td><a href="#crash/' + crash.id + '">' + crash.id + '</a></td>'
      buf = buf + '<td nowrap>' + crash.ymd + '<br/><span class="ago">' + crash.ago + '</span></td>'
      buf = buf + '<td>' + crash.version + '<br/><span class="ago">' + crash.electron_version + '</span></td>'
      buf = buf + '<td>' + crash.canonical_platform + '</td>'
      buf = buf + '<td>' + crash.platform + ' ' + crash.cpu + '<br/><span class="ago">' + crash.operating_system_name + '</span></td>'
      buf = buf + '<td>' + crash.crash_reason + '<br/>' + crash.signature + '</td>'
      buf = buf + '</tr>'
      table.append(buf)
    })
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = DevelopmentCrashes
