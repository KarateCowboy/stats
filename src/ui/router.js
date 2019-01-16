// Setup menu handler routes
const router = new Grapnel()

router.get('search', function (req) {
  pageState.currentlySelected = 'mnSearch'
  viewState.showControls = false
  viewState.showPromotions = false
  viewState.showShowToday = false
  viewState.showRefFilter = false
  updatePageUIState()
  refreshData()
})

router.get('overview', function (req) {
  pageState.currentlySelected = 'mnOverview'
  viewState.showControls = false
  viewState.showPromotions = false
  viewState.showShowToday = false
  viewState.showRefFilter = false
  updatePageUIState()
  refreshData()
})

router.get('versions', function (req) {
  pageState.currentlySelected = 'mnVersions'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  viewState.showRefFilter = true
  VueApp.$data.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('retention', function (req) {
  pageState.currentlySelected = 'mnRetention'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  viewState.showRefFilter = false
  updatePageUIState()
  refreshData()
})

router.get('retention_month', function (req) {
  pageState.currentlySelected = 'mnRetentionMonth'
  viewState.showControls = true
  viewState.showDaysSelector = false
  viewState.showPromotions = false
  viewState.showShowToday = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('weekly-retention', function (req) {
  pageState.currentlySelected = 'weeklyRetention'
  viewState.showControls = true
  viewState.showDaysSelector = false
  viewState.showPromotions = false
  viewState.showShowToday = false
  viewState.showRefFilter = true
  VueApp.$data.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage', function (req) {
  pageState.currentlySelected = 'mnUsage'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  viewState.showRefFilter = true
  VueApp.$data.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_returning', function (req) {
  pageState.currentlySelected = 'mnUsageReturning'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  viewState.showRefFilter = true
  VueApp.$data.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_month', function (req) {
  pageState.currentlySelected = 'mnUsageMonth'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  VueApp.$data.showRefFilter = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_month_agg', function (req) {
  pageState.currentlySelected = 'mnUsageMonthAgg'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  VueApp.$data.showRefFilter = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_month_average_agg', function (req) {
  pageState.currentlySelected = 'mnUsageMonthAverageAgg'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  VueApp.$data.showRefFilter = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_month_average', function (req) {
  pageState.currentlySelected = 'mnUsageMonthAverage'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  VueApp.$data.showRefFilter = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_month_average_new_agg', function (req) {
  pageState.currentlySelected = 'mnUsageMonthAverageNewAgg'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  VueApp.$data.showRefFilter = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('usage_month_average_new', function (req) {
  pageState.currentlySelected = 'mnUsageMonthAverageNew'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  VueApp.$data.showRefFilter = true
  viewState.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('daily_new', function (req) {
  pageState.currentlySelected = 'mnDailyNew'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  viewState.showRefFilter = true
  VueApp.$data.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('daily_usage_stats', function (req) {
  pageState.currentlySelected = 'mnDailyUsageStats'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  viewState.showRefFilter = false
  VueApp.$data.showRefFilter = false
  updatePageUIState()
  refreshData()
})

router.get('usage_agg', function (req) {
  pageState.currentlySelected = 'mnUsageAgg'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = true
  viewState.showShowToday = true
  viewState.showRefFilter = true
  VueApp.$data.showRefFilter = true
  updatePageUIState()
  refreshData()
})

router.get('top_crashes', function (req) {
  pageState.currentlySelected = 'mnTopCrashes'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  viewState.showRefFilter = false
  VueApp.$data.showRefFilter = false
  updatePageUIState()
  refreshData()

  // Show and hide sub-sections
  $('#top-crash-table').show()
  $('#crash-detail').hide()
  $('#crash-list-table').hide()
})

router.get('crash_ratio', function (req) {
  pageState.currentlySelected = 'mnCrashRatio'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  viewState.showRefFilter = false
  VueApp.$data.showRefFilter = false
  updatePageUIState()
  refreshData()

  $('#crash-ratio-table').show()
  $('#crash-ratio-detail-table').hide()
})

router.get('development_crashes', function (req) {
  pageState.currentlySelected = 'mnDevelopmentCrashes'
  updatePageUIState()
  refreshData()
})

router.get('recent_crashes', function (req) {
  pageState.currentlySelected = 'mnRecentCrashes'
  viewState.showRefFilter = false
  updatePageUIState()
  refreshData()
})

router.get('crashes_platform_detail/:ymd/:platform', function (req) {
  pageState.currentlySelected = 'mnCrashesDetails'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  viewState.showRefFilter = false
  updatePageUIState()
  // refreshData()
})

router.get('crashes_platform_version', function (req) {
  pageState.currentlySelected = 'mnCrashesVersion'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  viewState.showRefFilter = false
  updatePageUIState()
  refreshData()
})

router.get('crashes_platform', function (req) {
  pageState.currentlySelected = 'mnCrashes'
  updatePageUIState()
  refreshData()
})

router.get('eyeshade', function (req) {
  pageState.currentlySelected = 'mnEyeshade'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

router.get('eyeshade_funded', function (req) {
  pageState.currentlySelected = 'mnFundedEyeshade'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

router.get('eyeshade_funded_percentage', function (req) {
  pageState.currentlySelected = 'mnFundedPercentageEyeshade'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

router.get('eyeshade_funded_balance', function (req) {
  pageState.currentlySelected = 'mnFundedBalanceEyeshade'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

router.get('eyeshade_funded_balance_average', function (req) {
  pageState.currentlySelected = 'mnFundedBalanceAverageEyeshade'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

router.get('telemetry_standard', function (req) {
  pageState.currentlySelected = 'mnTelemetryStandard'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

router.get('daily_publishers', function (req) {
  pageState.currentlySelected = 'mnDailyPublishers'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = true
  updatePageUIState()
  refreshData()
})

// Display a single crash report
router.get('crash/:id', function (req) {
  pageState.currentlySelected = 'mnTopCrashes'
  viewState.showControls = false
  viewState.showPromotions = false
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

  var loadAvailableCrashTags = function (id) {
    $.ajax('/api/1/available_crash_tags', {
      success: function (rows) {
        var ul = $('#availableCrashTags')
        ul.empty()
        _.each(rows, function (row) {
          ul.append('<li><a href="#" data-tag="' + row.tag + '">' + row.tag + '</a></li>')
        })
        $('#availableCrashTags a').on('click', function (e) {
          var tag = $(e.target).attr('data-tag')
          $.ajax({
            method: 'POST',
            url: '/api/1/crashes/' + req.params.id + '/tags/' + tag,
            success: function (results) {
              loadCrashTags(id)
            }
          })
        })
      }
    })
  }

  var loadCrashTags = function (id) {
    $.ajax('/api/1/crashes/' + id + '/tags', {
      success: function (rows) {
        var buf = ''
        _.each(rows, function (row) {
          buf = buf + '<span class="label label-info tag">' + row.tag + ' <i class="fa fa-trash pointer" data-tag="' + row.tag + '"></i></span> '
        })
        $('#crash-tags').html(buf)
        $('#crash-tags i').on('click', function (e) {
          var i = $(this)
          $.ajax({
            method: 'DELETE',
            url: '/api/1/crashes/' + id + '/tags/' + i.attr('data-tag'),
            success: function (results) {
              i.parent().remove()
            }
          })
        })
      }
    })
  }

  function objectToTable (obj) {
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

// Display a list of crash reports
router.get('crash_list/:platform/:version/:days/:crash_reason/:cpu/:signature', function (req) {
  pageState.currentlySelected = 'mnTopCrashes'
  // Show and hide sub-sections
  $('#top-crash-table').hide()
  $('#crash-detail').hide()
  $('#crash-list-table').show()

  var params = $.param({
    platform: req.params.platform,
    version: req.params.version,
    days: req.params.days,
    crash_reason: req.params.crash_reason,
    cpu: req.params.cpu,
    signature: req.params.signature
  })

  $.ajax('/api/1/crash_report_details?' + params, {
    success: function (crashes) {
      $('#contentTitle').html('Crash Reports')
      var table = $('#crash-list-table tbody')
      table.empty()
      _.each(crashes, function (crash) {
        var buf = '<tr>'
        buf = buf + '<td><a href="#crash/' + crash.id + '">' + crash.id + '</a></td>'
        buf = buf + '<td nowrap>' + crash.ymd + '<br/><span class="ago">' + crash.ago + '</span></td>'
        buf = buf + '<td>' + crash.version + '<br/><span class="ago">' + crash.electron_version + '</span></td>'
        buf = buf + '<td>' + crash.platform + '<br/><span class="ago">' + crash.operating_system_name + '</span></td>'
        buf = buf + '<td>' + crash.cpu + '</td>'
        buf = buf + '<td>' + crash.crash_reason + '<br/>' + crash.signature + '</td>'
        buf = buf + '</tr>'
        table.append(buf)
      })
    }
  })
})

router.get('downloads', function (req) {
  pageState.currentlySelected = 'mnDownloads'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = false
  updatePageUIState()
  refreshData()
})

router.get('daily_new_users', function(req){
  pageState.currentlySelected = 'mnDailyNewUsers'
  viewState.showControls = true
  viewState.showDaysSelector = true
  viewState.showPromotions = false
  viewState.showShowToday = false
  updatePageUIState()
  refreshData()
})
module.exports.default = router
