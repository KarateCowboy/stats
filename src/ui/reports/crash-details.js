const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

const objectToTable = (obj) => {
  var buffer = '<table class=\'table table-striped\'>'
  _.each(_.keys(obj).sort(), function (k) {
    if (!_.isObject(obj[k])) {
      buffer += '<tr><td>' + k + '</td><td>' + obj[k] + '</td></tr>'
    } else {
      buffer += '<tr><td>' + k + '</td><td>' + objectToTable(obj[k]) + '</td></tr>'
    }
  })
  buffer += '</table>'
  return buffer
}

class CrashDetails extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Crash Details'
    this.subtitle = ''
    this.path = 'crash/:id'
    this.menuTitle = 'Crash'
    this.menuId = 'crash'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'topCrashContent'
    this.menuConfig.showControls = false
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showRefFilter = false
    this.menuConfig.showCountryCodeFilter = false
  }

  async retriever (req) {
    const payload = await $.ajax('/api/1/crash_report?id=' + req.params.id)
    this.handler(payload)
  }

  handler (payload) {
    $('#top-crash-table').hide()
    $('#crash-detail').show()
    $('#crash-list-table').hide()
    const table = $('#crash-detail-table tbody')
    table.empty()
    $('#crash-download-container').empty()
    $('#crash-detail-stack').empty()

    const crash = payload.crash

    $('#contentTitle').html('Crash Report ' + crash.contents._id)
    console.log(crash)
    table.empty()
    var info = _.extend(
      _.clone(crash.contents),
      crash.contents.metadata || {}
    )

    _.each(_.keys(info).sort(), function (k) {
      if (!_.isObject(info[k])) {
        table.append('<tr><td>' + k + '</td><td>' + info[k] + '</td></tr>')
      } else {
        table.append('<tr><td>' + k + '</td><td>' + objectToTable(info[k]) + '</td></tr>')
      }
    })
    $('#crash-detail-stack').html(payload.crash_report)
    $('#crash-download-container').html('<a class=\'btn btn-primary\' href=\'/download/crash_report/' + crash.contents._id + '\'>Download Binary Dump</a>')

    $(`#${this.contentTagId}`).show()
  }
}

module.exports = CrashDetails

/*
// Display a single crash report
  router.get('crash/:id', function (req) {
    pageState.currentlySelected = 'mnTopCrashes'
    viewState.showControls = false
    viewState.showShowToday = true
    updatePageUIState()
    // Show and hide sub-sections
    $('#top-crash-table').hide()
    $('#crash-detail').show()
    $('#crash-list-table').hide()
    pageState.currentlySelected = null

    var table = $('#crash-detail-table tbody')
    $('#contentTitle').html('Loading...')
    table.empty()
    $('#crash-download-container').empty()
    $('#crash-detail-stack').empty()

    $.ajax('/api/1/crash_report?id=' + req.params.id, {
      success: function (crash) {
        $('#controls').hide()
        $('#contentTitle').html('Crash Report ' + req.params.id)
        console.log(crash)
        table.empty()
        loadAvailableCrashTags(req.params.id)
        loadCrashTags(req.params.id)
        var info = _.extend(_.clone(crash.crash.contents), crash.crash.contents.metadata || {})
        _.each(_.keys(info).sort(), function (k) {
          if (!_.isObject(info[k])) {
            table.append('<tr><td>' + k + '</td><td>' + info[k] + '</td></tr>')
          } else {
            table.append('<tr><td>' + k + '</td><td>' + objectToTable(info[k]) + '</td></tr>')
          }
        })
        $('#crash-detail-stack').html(crash.crash_report)
        $('#crash-download-container').html('<a class=\'btn btn-primary\' href=\'/download/crash_report/' + req.params.id + '\'>Download Binary Dump</a>')
      }
    })
  })
*/

