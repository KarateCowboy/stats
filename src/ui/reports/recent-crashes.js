const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const color = require('../color')

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

    this.menuConfig.showMobile = false
    this.menuConfig.showMuon = false
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showRefFilter = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showPagination = true
  }

  async retriever () {
    let results
    try {
      const urlParams = $.param(this.app.pageState.standardParams())
      console.log(urlParams)
      results = await $.ajax('/api/1/recent_crash_report_details?' + urlParams)
      this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e)
    }
  }

  handler (crashes) {
    const table = $('#recent-crash-list-table tbody')
    const channelIndicators = {
      'dev': '<span class="dev label label-primary">Developer</span>',
      'nightly': '<span class="nightly label label-warning">Nightly</span>',
      'beta': '<span class="beta label label-success">Beta</span>',
      'release': '<span class="release label label-info">Release / Stable</span>'
    }
    const platformIndicators = {
      'osx-bc': `<span class="osx-bc"><img width="12" height="12" src='/local/img/platform-icons/osx.png'> macOS</span>`,
      'winx64-bc': `<span class="winx64-bc"><img width="12" height="12" src='/local/img/platform-icons/winx64.png'> Win64</span>`,
      'winia32-bc': `<span class="winia32-bc"><img width="12" height="12" src='/local/img/platform-icons/winia32.png'> Win32</span>`,
      'linux-bc': `<span class="linux-bc"><img width="12" height="12" src='/local/img/platform-icons/linux.png'> Linux</span>`
    }
    table.empty()
    _.each(crashes, (crash) => {
      const versionColor = color.colorForHashedLabel(crash.chromium_major_version + '', 1)
      const buf = `
        <tr>
          <td><a href="#crash/${crash.id}">${crash.id}</a></td>
          <td nowrap>${crash.ymd}</td>
          <td nowrap><span style="border-radius: 2px; background-color: ${versionColor}; padding: 4px;">${crash.version}</span></td>
          <td>${channelIndicators[crash.channel] || ''}</td>
          <td nowrap>${platformIndicators[crash.platform] || ''}</td>
          <td>${crash.cpu}<br/><span class="ago">${crash.operatingSystemName}</span></td>
          <td>${crash.crashReason}<br/>${crash.signature}</td>
        </tr>
        `
      table.append(buf)
    })
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = RecentCrashes
