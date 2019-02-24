const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class RecentCrashes extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Recent Crash Reports'
    this.subtitle = ''
    this.path = 'recent_crashes'
    this.menuTitle = 'Recent Crashes'
    this.menuId = 'recentCrashes'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'recentCrashContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    let results
    try {
      results = await $.ajax('/api/1/recent_crash_report_details?' + $.param(this.app.pageState.standardParams()))
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e.message)
    }
  }

  handler (crashes) {
    let table = $('#recent-crash-list-table tbody')
    table.empty()
    _.each(crashes, function (crash) {
      let rowClass = ''
      if (crash.node_env == 'development') {
        rowClass = 'warning'
      }
      var buf = '<tr class="' + rowClass + '">'
      buf = buf + '<td><a href="#crash/' + crash.id + '">' + crash.id + '</a></td>'
      buf = buf + '<td nowrap>' + crash.ymd + '<br/><span class="ago">' + crash.ago + '</span></td>'
      buf = buf + '<td>' + crash.version + ' (' + crash.channel + ')<br/><span class="ago">' + crash.electron_version + '</span></td>'
      buf = buf + '<td>' + crash.canonical_platform + '</td>'
      buf = buf + '<td>' + crash.platform + ' ' + crash.cpu + '<br/><span class="ago">' + crash.operating_system_name + '</span></td>'
      buf = buf + '<td>' + crash.crash_reason + '<br/>' + crash.signature + '</td>'
      buf = buf + '</tr>'
      table.append(buf)
    })
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = RecentCrashes
