const BaseReportComponent = require('../base-report-component')
const { td, th, tr, st, st1, stp, std } = require('../builders')
const $ = require('jquery')

class SearchCrashes extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Search'
    this.subtitle = ''
    this.path = 'search'
    this.menuTitle = 'Search Crashes'
    this.menuId = 'search'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'searchContent'
    this.menuConfig.showControls = false
    this.menuConfig.showShowToday = false
    this.menuConfig.showRefFilter = false
    this.menuConfig.showDaysSelector = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showWOISFilter = false
  }

  async retriever () {
    $(`#${this.contentTagId}`).show()
    $('#searchText').on('input', _.debounce(this.handler, 500))
  }

  handler () {
    console.log('executing crash search handler')
    var q = this.value
    var table = $('#search-results-table tbody')
    if (!q) {
      $('#searchComments').hide()
      table.empty()
      return
    }
    $('#searchComments').show()
    $('#searchComments').html('Searching: ' + q)
    $.ajax('/api/1/search?query=' + encodeURIComponent(q), {
      success: function (results) {
        table.empty()
        $('#searchComments').show()
        if (results.rowCount > results.limit) {
          $('#searchComments').html('Showing ' + results.limit + ' of ' + results.rowCount + ' crashes')
        } else {
          if (results.rowCount === 0) {
            $('#searchComments').html('No crashes found')
          } else {
            $('#searchComments').html('Showing ' + results.rowCount + ' crashes')
          }
        }
        console.log(results)
        var crashes = results.crashes
        _.each(crashes, function (crash, idx) {
          var rowClass = ''
          table.append(tr([
              td(idx + 1),
              td('<a href="#crash/' + crash.contents.id + '">' + crash.contents.id + '</a><br>(' + crash.contents.crash_id + ')'),
              td(crash.contents.ver),
              td(crash.contents.version),
              td(crash.contents.year_month_day),
              td(crash.contents.platform + ' ' + crash.contents['metadata->cpu']),
              td(crash.contents['metadata->operating_system_name'])
            ], {'classes': rowClass}
          ))
          table.append(tr([td(), '<td colspan="7">' + crash.contents['metadata->signature'] + '</td>'], {'classes': rowClass}))
        })
      }
    })

    // const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})
    // handler(data)
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = SearchCrashes
