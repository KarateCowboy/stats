// Platform meta data
const platforms = {
  osx: {
    id: 'osx',
    label: 'OSx',
    mobile: false
  },
  winx64: {
    id: 'winx64',
    label: 'Windows x64',
    mobile: false
  },
  winia32: {
    id: 'winia32',
    label: 'Windows ia32',
    mobile: false
  },
  linux: {
    id: 'linux',
    label: 'Linux',
    mobile: false
  },
  android: {
    id: 'android',
    label: 'Android',
    mobile: true
  },
  androidbrowser: {
    id: 'androidbrowser',
    label: 'Android Browser',
    mobile: true
  },
  ios: {
    id: 'ios',
    label: 'iOS',
    mobile: true
  },
  'winx64-bc': {
    id: ' winx64-bc',
    label: 'Win64 Brave Core',
    mobile: false
  },
  'winia32-bc': {
    id: 'winia32-bc',
    label: 'Win32 Brave Core',
    mobile: false
  },
  'osx-bc': {
    id: 'osx-bc',
    label: 'OSx Brave Core',
    mobile: false
  },
  'linux-bc': {
    id: 'linux-bc',
    label: 'Linux Brave Core',
    mobile: false
  }
}

// Channel meta data
var channels = {
  dev: {
    id: 'dev',
    label: 'Release'
  },
  beta: {
    id: 'beta',
    label: 'Beta'
  },
  stable: {
    id: 'stable',
    label: 'Stable'
  },
  release: {
    id: 'release',
    label: 'release'
  }
}

var platformKeys = _.keys(platforms)
var channelKeys = _.keys(channels)

var round = function (x, n) {
  n = n || 0
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}

var td = function (contents, align, opts) {
  contents = contents || ''
  align = align || 'left'
  opts = opts || {}
  return '<td class="text-' + align + '">' + contents + '</td>'
}

var ptd = function (val, per, align, opts) {
  contents = contents || ''
  align = align || 'left'
  opts = opts || {}
  return '<td class="text-' + align + '">' + val + ' <span class="subvalue">' + per + '</span></td>'
}

var tdsv = function (val, per) {
  return '<td class="text-right">' + val + '</td><td><span class="subvalue">' + numeral(per).format('0.0%') + '</span></td>'
}

var th = function (contents, align, opts) {
  contents = contents || ''
  align = align || 'left'
  opts = opts || {}
  return '<th class="text-' + align + '">' + contents + '</th>'
}

var tr = function (tds, opts) {
  tds = tds || []
  opts = opts || {}
  var buf = '<tr '
  if (opts.classes) {
    buf += ' class="' + opts.classes + '" '
  }
  buf += '>' + tds.join('') + '</tr>'
  return buf
}

var ellipsify = function (text, length) {
  text = text || ''
  if (text.length > length) {
    return text.substring(0, length) + '…'
  } else {
    return text
  }
}

// standard integer number format i.e. 123,456
var st = function (num) {
  return numeral(num).format('0,0')
}

// standard dollar number format i.e. 123,456.78
var std = function (num) {
  return numeral(num).format('0,0.00')
}

// standard number format i.e. 123,456.7
var st1 = function (num) {
  return numeral(num).format('0,0.0')
}

// standard number format i.e. 123,456.7
var st3 = function (num) {
  return numeral(num).format('0,0.000')
}

// standard percentage form i.e. 45.3%
var stp = function (num) {
  return numeral(num).format('0.0%')
}

var b = function (text) { return '<strong>' + text + '</strong>' }

var builders = {round, td, ptd, th, tr, st, td, st1, st3, stp, b, std}

let clampZeroToOneHundred = (v) => {
  if (v < 0) return 0
  if (v > 100) return 100
  return v
}

var crashVersionHandler = function (rows) {
  var s = $('#crash-ratio-versions')
  s.empty()
  s.append('<option value="">All</option>')
  _.each(rows, function (row) {
    var buf = '<option value="' + row.version + '" '
    if (pageState.version === row.version) {
      buf = buf + 'SELECTED'
    }
    buf = buf + '>' + row.version + '</option>'
    s.append(buf)
  })
}

var crashRatioHandler = function (rows) {
  $.ajax('/api/1/crash_versions?' + standardParams(), {
    success: crashVersionHandler
  })
  var table = $('#crash-ratio-table tbody')
  table.empty()
  rows.forEach(function (row) {
    var params = [row.platform, row.version, pageState.days].join('/')
    var buf = '<tr>'
    buf = buf + '<td class="text-right"><a href="#crash_ratio_list/' + params + '">' + round(row.crash_rate * 100, 1) + '</a></td>'
    buf = buf + '<td class="text-left">' + row.version + '</td>'
    buf = buf + '<td class="text-left">' + row.platform + '</td>'
    buf = buf + '<td class="text-right">' + row.crashes + '</td>'
    buf = buf + '<td class="text-right">' + row.total + '</td>'

    buf = buf + '</tr>'
    table.append(buf)
  })
}

var topCrashHandler = function (rows) {
  var table = $('#top-crash-table tbody')
  table.empty()
  var sum = _.reduce(rows, function (memo, row) { return memo + parseInt(row.total) }, 0)
  rows.forEach(function (row) {
    var params = [row.platform, row.version, pageState.days, encodeURIComponent(row.crash_reason), row.cpu, encodeURIComponent(row.signature)].join('/')
    var buf = '<tr>'
    var percentage = round(row.total / sum * 100, 1)
    buf = buf + '<td class="text-right"><a href="#crash_list/' + params + '">' + row.total + '</a><br/><span class="ago">' + percentage + '%</span></td>'
    buf = buf + '<td class="text-left">' + row.version + '</td>'
    buf = buf + '<td class="text-left">' + row.canonical_platform + '</td>'
    buf = buf + '<td class="text-left">' + row.platform + ' ' + row.cpu + '</td>'
    buf = buf + '<td class="text-left">' + row.crash_reason + '<br/>' + row.signature + '</td>'
    buf = buf + '</tr>'
    table.append(buf)
  })
}

var statsHandler = function (rows) {
  // Build the table
  var table = $('#statsDataTable tbody')
  table.empty()
  rows.forEach(function (row) {
    var buf = '<tr>'
    buf = buf + '<td nowrap>' + row.ymd + '</td>'
    buf = buf + '<td class="text-right">' + row.count + '</td>'
    buf = buf + '<td class="text-right">' + row.prev + '</td>'
    buf = buf + '<td class="text-right">' + row.delta + '</td>'
    buf = buf + '<td class="text-right">' + round(row.change * 100, 1) + '</td>'
    buf = buf + '<td class="text-right">' + row.first_count + '</td>'
    buf = buf + '<td class="text-right">' + round(row.retention, 1) + '</td>'
    buf = buf + '</tr>'
    table.append(buf)
  })

  // Build the graph
  rows = rows.reverse()

  // Build a list of unique labels (ymd)
  var labels = _.chain(rows)
    .map(function (row) { return row.ymd })
    .uniq()
    .sort()
    .value()

  var ys = ['change', 'retention']

  // Build the Chart.js data structure
  var datasets = []
  ys.forEach(function (y) {
    var dataset = []
    rows.forEach(function (row) {
      dataset.push(row[y])
    })
    datasets.push(dataset)
  })

  var data = {
    labels: labels,
    datasets: _.map(datasets, function (dataset, idx) {
      return _.extend({
        label: ys[idx],
        data: dataset
      })
    })
  }

  var container = $('#statsChartContainer')
  container.empty()
  container.append('<canvas id=\'statsChart\' height=\'300\' width=\'800\'></canvas>')

  var statsChart = document.getElementById('statsChart')
  var ctx = statsChart.getContext('2d')
  var myChart = new Chart.Line(ctx, {data: data, options: window.STATS.COMMON.standardYAxisOptions})
}

// Build handler for a single value chart updater
let buildSingleValueChartHandler = (chartContainerId, x, y, xLabel, yLabel, opts) => {
  opts = opts || {}
  opts.valueClamper = opts.valueClamper || _.identity
  opts.colorIdx = opts.colorIdx || 0

  return (rows) => {
    if (opts.valueManipulator) rows = rows.map(opts.valueManipulator)

    // Build a list of unique x-axis labels (mostly ymd)
    var labels = _.chain(rows)
      .map((row) => { return row[x] })
      .uniq()
      .sort()
      .value()

    var product = _.object(_.map(labels, function (label) {
      return [label, {}]
    }))
    rows.forEach(function (row) {
      product[row[x]][y] = opts.valueClamper(row[y])
    })

    let dataset = labels.map((lbl) => {
      return product[lbl][y] || 0
    })

    let colourer = (idx, opacity) => {
      return window.STATS.COLOR.colorForIndex(idx, opacity)
    }

    var data = {
      labels: labels,
      datasets: [
        {
          label: yLabel,
          data: dataset,
          borderColor: colourer(opts.colorIdx, 1),
          pointColor: colourer(opts.colorIdx, 0.5),
          backgroundColor: colourer(opts.colorIdx, 0.05)
        }
      ]
    }

    let container = $('#' + chartContainerId)
    let chartId = chartContainerId + 'Chart'
    container.empty()
    container.append(`<canvas id='${chartId}' height='300' width='800'></canvas>`)

    var usageChart = document.getElementById(chartId)
    new Chart.Line(usageChart.getContext('2d'), {
      data: data,
      options: window.STATS.COMMON.standardYAxisOptions
    })
  }
}

// Build a handler for a successful API request
var buildSuccessHandler = function (x, y, x_label, y_label, opts) {
  opts = opts || {}
  x_label = x_label || 'Date'
  y_label = y_label || 'Platform'

  var value_func = function (row, value) {
    var formatter = st
    if (opts.percentage) {
      formatter = stp
    } else if (opts.currency) {
      formatter = std
    }
    return formatter(value)
  }

  if (opts.formatter) { value_func = opts.formatter }

  return function (rows) {
    var table = $('#usageDataTable tbody')

    const pivot = () => {
      table.empty()

      let tableHeader = table.parent().find('thead')
      tableHeader.empty()

      // build a sorted list of column headers
      let columns = {}
      rows = rows.sort((a, b) => {
        return b[x].localeCompare(a[x]) || b[y].localeCompare(a[y])
      })
      rows.forEach((row) => { columns[row[y]] = true })
      columns = Object.keys(columns).sort()

      // get the list of the keys for each row
      let groups = _.groupBy(rows, (row) => { return row[x] })
      let ks = Object.keys(groups).sort((a, b) => { return b.localeCompare(a) })

      // build the table headers
      let tableHeaderBuffer = `<tr><th>${x_label}</th>`
      for (let column of columns) {
        tableHeaderBuffer += `<th>${column}</th>`
      }
      tableHeaderBuffer += `<th>Total</th></tr>`
      tableHeader.html(tableHeaderBuffer)

      table.parent().addClass('table-striped')

      let buffer = ''
      for (let k of ks) {
        buffer += `<tr><td>${k}</td>`
        // calculate the total for the row
        let rowTotal = _.reduce(groups[k], (memo, row) => { return memo + (row.count || 0) }, 0)
        for (let column of columns) {
          let record = groups[k].find((row) => { return row[y] === column })
          // if a row doesn't exist build a blank one
          if (!record) record = {count: 0}
          buffer += `<td>${value_func(record, record.count)} <small class='text-muted'>${stp(record.count / rowTotal)}</small></td>`
        }
        buffer += `<td>${st(rowTotal)}</td></tr>`
      }
      table.append(buffer)
    }

    const standardTable = () => {
      table.empty()
      let tableHeader = table.parent().find('thead')
      tableHeader.empty()
      tableHeader.html(`<tr><th>${x_label}</th><th>${y_label}</th><th></th></tr>`)

      var ctrl = rows[x]
      var ctrlClass = ''
      var grandTotalAccumulator = 0
      var previousValue, difference, differenceRate, i
      rows.forEach(function (row) {
        if (!previousValue) previousValue = row.count
        if (row[x] !== ctrl) {
          // The ctrl has broken, we need to change grouping
          if (ctrlClass === 'active') {
            ctrlClass = ''
          } else {
            ctrlClass = 'active'
          }
          ctrl = row[x]
        }
        var buf = '<tr class="' + ctrlClass + '">'
        buf = buf + '<td>' + row[x] + '</td>'
        buf = buf + '<td>' + (row[y] || 'All') + '</td>'
        buf = buf + '<td class="text-right">' + value_func(row, row.count) + '</td>'
        if (row.daily_percentage !== undefined) {
          buf = buf + '<td class="text-right">' + stp(row.daily_percentage / 100) + '</td>'
        }
        if (opts.growth_rate) {
          difference = row.count - previousValue
          differenceRate = (difference / parseFloat(previousValue) * 100).toFixed(1)
          buf = buf + '<td class="text-right">' + value_func(row, difference) + '<span class="subvalue"> ' + differenceRate + '%</span>' + '</td>'
        }
        buf = buf + '</tr>'
        table.append(buf)
        previousValue = row.count
        grandTotalAccumulator += row.count
      })
    }

    if (opts.pivot) {
      pivot()
    } else {
      standardTable()
    }

    if (opts.growth_rate && rows[0]) {
      averageGrowthRate = Math.pow(rows[rows.length - 1].count / rows[0].count, 1 / rows.length) - 1
      averageGrowthRateDesc = 'Math.pow(' + rows[rows.length - 1].count + '/' + rows[0].count + ', 1 / ' + rows.length + ') - 1'
      console.log(averageGrowthRate)
      table.append(tr([
        td(),
        td(),
        td(),
        td('Average monthly growth rate ' + (averageGrowthRate * 100).toFixed(1) + '%<br><span class="subvalue">' + averageGrowthRateDesc + '</span>', 'right')
      ]))

      table.append(tr([
        td('Forward projections based on ' + (averageGrowthRate * 100).toFixed(1) + '% monthly growth rate'),
        td(st(rows[rows.length - 1].count))
      ]))

      for (i = 1; i < 13; i++) {
        table.append(tr([
          td(moment(rows[rows.length - 1].ymd).add(i, 'months').format('MMMM YYYY')),
          td(st(rows[rows.length - 1].count * Math.pow(1 + averageGrowthRate, i)))
        ]))
      }
    }

    // Show grand total line if option present
    if (opts.showGrandTotal) {
      table.append(tr([
        td(),
        td(),
        td(grandTotalAccumulator, 'right')
      ], {classes: 'info'}))
    }

    // Build a list of unique labels (ymd)
    var labels = _.chain(rows)
      .map(function (row) { return row[x] })
      .uniq()
      .sort()
      .value()

    // Build a list of unique data sets (platform)
    var ys = _.chain(rows)
      .map(function (row) { return row[y] })
      .uniq()
      .value()

    // Associate the data
    var product = _.object(_.map(labels, function (label) {
      return [label, {}]
    }))
    rows.forEach(function (row) {
      product[row[x]][row[y]] = row.count
    })

    // Build the Chart.js data structure
    var datasets = []
    ys.forEach(function (platform) {
      var dataset = []
      labels.forEach(function (label) {
        dataset.push(product[label][platform] || 0)
      })
      datasets.push(dataset)
    })

    // Determine the color of the line by label or index
    var colourer = function (idx, opacity) { return window.STATS.COLOR.colorForLabel(ys[idx], opacity) }
    if (opts.colourBy === 'index') {
      colourer = function (idx, opacity) { return window.STATS.COLOR.colorForIndex(idx, opacity) }
    }

    var data = {
      labels: labels,
      datasets: _.map(datasets, function (dataset, idx) {
        return {
          label: ys[idx] || 'All',
          data: dataset,
          borderColor: colourer(idx, 1),
          pointColor: colourer(idx, 0.5),
          backgroundColor: colourer(idx, 0.05)
        }
      })
    }

    var container = $('#usageChartContainer')
    container.empty()
    container.append('<canvas id=\'usageChart\' height=\'350\' width=\'800\'></canvas>')

    var usageChart = document.getElementById('usageChart')
    new Chart.Line(usageChart.getContext('2d'), {data: data, options: window.STATS.COMMON.standardYAxisOptions})
  }
}

const downloadsHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})

const dailyNewUsersHandler = buildSuccessHandler('ymd', 'platform')

const usagePlatformHandlerStandard = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})

const usagePlatformHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label', pivot: true})

const usageMeasureHandler = (rows) => {
  let CostPerInstall = 0

  if (rows.length === 0) return
  $('#DNUDAUFullContents').fadeIn()

  const resetCost = (evt) => {
    if (evt) evt.stopPropagation()
    $('#DNUDAUCostDisplay').hide()
    $('#DNUDAUCaptureValues').show()
  }
  $('#DNUDAUCostChange').on('click', resetCost)
  resetCost()

  dauHandler = buildSingleValueChartHandler('dauChartContainer', 'ymd', 'dau', 'Date', 'DAU', {colorIdx: 0})
  dauHandler(rows)

  dnuHandler = buildSingleValueChartHandler('dnuChartContainer', 'ymd', 'dnu', 'Date', 'DNU', {colorIdx: 1})
  dnuHandler(rows)

  retainedHandler = buildSingleValueChartHandler('retainedChartContainer', 'ymd', 'retained', 'Date', 'Retained %', {
    colorIdx: 2,
    valueClamper: clampZeroToOneHundred,
    valueManipulator: (row) => {
      let modifiedRow = _.clone(row)
      modifiedRow.retained *= 100
      modifiedRow.retained = Math.round(modifiedRow.retained * 10000) / 10000
      return modifiedRow
    }
  })
  retainedHandler(rows)

  let tbl = $('#DNUDAUDataTable tbody')
  tbl.empty()
  rows.reverse().forEach((row) => {
    tbl.append(tr([
      td(row.ymd),
      td(st(row.dau), 'right'),
      td(st(row.dnu), 'right'),
      td(st(row.dnuSum), 'right'),
      td(stp(row.retained), 'right')
    ]))
  })

  let firstRecords = (lst, n = 7) => {
    if (lst.length < n) return lst
    return lst.slice(0, n)
  }

  let firstRows = firstRecords(rows)
  let firstRowValues = {
    dau: STATS.STATS.avg(_.pluck(firstRows, 'dau')),
    installs: STATS.STATS.avg(_.pluck(firstRows, 'dnuSum'))
  }
  firstRowValues.retained = firstRowValues.dau / firstRowValues.installs

  let oneDay = ` <small>${moment(rows[0].ymd).format('MMM Do')}</small>`
  let sevenDay = ` <small>last 7 days</small>`

  $('#DNUDAURetentionLabel').html(stp(rows[0].retained) + oneDay)
  $('#DNUDAURetentionLabel7').html(stp(firstRowValues.retained) + sevenDay)

  $('#DNUDAUDailyActivesLabel').html(st(rows[0].dau) + oneDay)
  $('#DNUDAUDailyActivesLabel7').html(st(firstRowValues.dau) + sevenDay)

  $('#DNUDAUInstallsLabel').html(st(rows[0].dnuSum) + oneDay)
  $('#DNUDAUInstallsLabel7').html(st(firstRowValues.installs) + sevenDay)

  $('#DNUDAUUpdate').on('click', (evt) => {
    CostPerInstall = parseFloat($('#DNUDAUCost').val())
    if (_.isNaN(CostPerInstall)) CostPerInstall = 0
    CostCurrency = $('#DNUDAUCurrency').val()
    let costPerDAU = {
      one: (rows[0].dnuSum * CostPerInstall) / rows[0].dau,
      seven: (firstRowValues.installs * CostPerInstall) / firstRowValues.dau
    }
    $('#DNUDAUCostPerDAULabel').html(std(costPerDAU.one) + ' <small>(' + CostCurrency + ')</small> ' + oneDay)
    $('#DNUDAUCostPerDAULabel7').html(std(costPerDAU.seven) + ' <small>(' + CostCurrency + ')</small> ' + sevenDay)
    $('#DNUDAUCostDisplay').show()
    $('#DNUDAUCaptureValues').hide()
  })
}

var retentionHandler = buildSuccessHandler('ymd', 'woi', 'Date', 'Week of installation', {colourBy: 'index'})

var aggMAUHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label', growth_rate: true})

var usageVersionHandler = buildSuccessHandler('ymd', 'version', 'Date', 'Version', {colourBy: 'index', pivot: true})

var usageCrashesHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})

var walletsTotalHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {showGrandTotal: true})

var walletsCurrencyHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {
  showGrandTotal: true,
  currency: true
})

var walletsHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {
  showGrandTotal: false,
  percentage: true
})

var walletsBalanceAverageHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {
  showGrandTotal: false,
  currency: true
})

// Array of content panels
var contents = [
  'usageContent',
  'DNUDAUContent',
  'publisherContent',
  'crashesContent',
  'overviewContent',
  'statsContent',
  'topCrashContent',
  'recentCrashContent',
  'developmentCrashContent',
  'crashRatioContent',
  'searchContent',
  'retentionMonthContent',
  'weeklyRetentionContent'
]

var serializePlatformParams = function () {
  var filterPlatforms = _.filter(platformKeys, function (id) {
    return pageState.platformFilter[id]
  })
  return filterPlatforms.join(',')
}

var serializeChannelParams = function () {
  var filterChannels = _.filter(channelKeys, function (id) {
    return pageState.channelFilter[id]
  })
  if (pageState.channelFilter.release) filterChannels.push('stable')
  return filterChannels.join(',')
}

let standardParams = () => {
  return $.param({
    days: pageState.days,
    platformFilter: serializePlatformParams(),
    channelFilter: serializeChannelParams(),
    showToday: pageState.showToday,
    version: pageState.version,
    ref: (pageState.ref || []).join(','),
    wois: (pageState.wois || []).join(',')
  })
}

var retentionRetriever = function () {
  $.ajax('/api/1/retention?' + standardParams(), {
    success: (rows) => {
      // map week of installation field to 'Month Day'
      rows = rows.map((row) => {
        row.woi = moment(row.woi).format('MMM DD')
        return row
      })
      retentionHandler(rows)
    }
  })
}

const weeklyRetentionRetriever = async () => {
  $.ajax('/api/1/retention_week?' + standardParams(), {
    success: (rows) => {
      window.RETENTION.weeklyRetentionHandler(rows)
    }
  })
}

var versionsRetriever = function () {
  $.ajax('/api/1/versions?' + standardParams(), {
    success: usageVersionHandler
  })
}

var DAUPlatformRetriever = function () {
  $.ajax('/api/1/dau_platform?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var DNUDAURetriever = function () {
  $('#DNUDAUFullContents').hide()
  setTimeout(() => {
    $('#DNUDAUInstructions').fadeOut()
  }, 10000)
  $.ajax('/api/1/daily_retention?' + standardParams(), {
    success: usageMeasureHandler
  })
}

var downloadsRetriever = async function () {
  $.ajax('/api/1/daily_downloads?' + standardParams(), {
    success: downloadsHandler
  })
}

var DAUReturningPlatformRetriever = function () {
  $.ajax('/api/1/dau_platform_minus_first?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var MAUPlatformRetriever = function () {
  $.ajax('/api/1/mau_platform?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var MAUAggPlatformRetriever = function () {
  $.ajax('/api/1/mau?' + standardParams(), {
    success: aggMAUHandler
  })
}

var MAUAverageAggPlatformRetriever = function () {
  $.ajax('/api/1/dau_monthly_average?' + standardParams(), {
    success: usagePlatformHandlerStandard
  })
}

var MAUAveragePlatformRetriever = function () {
  $.ajax('/api/1/dau_monthly_average_platform?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var MAUAverageNewAggPlatformRetriever = function () {
  $.ajax('/api/1/dau_first_monthly_average?' + standardParams(), {
    success: usagePlatformHandlerStandard
  })
}

var MAUAverageNewPlatformRetriever = function () {
  $.ajax('/api/1/dau_first_monthly_average_platform?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var DNUPlatformRetriever = function () {
  $.ajax('/api/1/dau_platform_first?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var DAURetriever = function () {
  $.ajax('/api/1/dau?' + standardParams(), {
    success: usagePlatformHandlerStandard
  })
}

var DUSRetriever = function () {
  $.ajax('/api/1/dus?' + standardParams(), {
    success: statsHandler
  })
}

var topCrashesRetriever = function () {
  $.ajax('/api/1/crash_reports?' + standardParams(), {
    success: topCrashHandler
  })
}

var crashRatioRetriever = function () {
  $.ajax('/api/1/crash_ratios?' + standardParams(), {
    success: crashRatioHandler
  })
}

var recentCrashesRetriever = function () {
  $.ajax('/api/1/recent_crash_report_details?' + standardParams(), {
    success: function (crashes) {
      $('#contentTitle').html('Recent Crash Reports')
      var table = $('#recent-crash-list-table tbody')
      table.empty()
      _.each(crashes, function (crash) {
        var rowClass = ''
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
    }
  })
}

var developmentCrashesRetriever = function () {
  $.ajax('/api/1/development_crash_report_details?' + standardParams(), {
    success: function (crashes) {
      $('#contentTitle').html('Development Crash Reports')
      var table = $('#development-crash-list-table tbody')
      table.empty()
      _.each(crashes, function (crash) {
        var rowClass = ''
        var buf = '<tr class="' + rowClass + '">'
        buf = buf + '<td><a href="#crash/' + crash.id + '">' + crash.id + '</a></td>'
        buf = buf + '<td nowrap>' + crash.ymd + '<br/><span class="ago">' + crash.ago + '</span></td>'
        buf = buf + '<td>' + crash.version + '<br/><span class="ago">' + crash.electron_version + '</span></td>'
        buf = buf + '<td>' + crash.canonical_platform + '</td>'
        buf = buf + '<td>' + crash.platform + ' ' + crash.cpu + '<br/><span class="ago">' + crash.operating_system_name + '</span></td>'
        buf = buf + '<td>' + crash.crash_reason + '<br/>' + crash.signature + '</td>'
        buf = buf + '</tr>'
        table.append(buf)
      })
    }
  })
}

var crashesRetriever = function () {
  $.ajax('/api/1/dc_platform?' + standardParams(), {
    success: usageCrashesHandler
  })
}

var crashesDetailRetriever = function () {
  $.ajax('/api/1/dc_platform?' + standardParams(), {
    success: usageCrashesHandler
  })
}

var crashesVersionRetriever = function () {
  $.ajax('/api/1/dc_platform_version?' + standardParams(), {
    success: usagePlatformHandler
  })
}

// Retrieve overview stats and dispatch UI build
var overviewRetriever = async function () {
  publisherPlatforms = publisherPlatforms !== undefined ? publisherPlatforms : await $.ajax('/api/1/publishers/platforms')
  var downloads = await $.ajax('/api/1/dau_platform_first_summary')
  try {
    window.OVERVIEW.firstRun(downloads, builders)
  } catch (e) {
    console.log('Error running #firstRun')
    console.log(e.message)
  }

  var platformStats = await $.ajax('/api/1/monthly_average_stats_platform')
  window.OVERVIEW.monthAveragesHandler(platformStats, builders)
  let channel_totals, publisher_totals
  try {
    channel_totals = await $.ajax('/api/1/publishers/channel_totals')
    publisher_totals = await $.ajax('/api/1/publishers/publisher_totals')
    window.STATS.PUB.overviewPublisherHandler(channel_totals, publisher_totals)
  } catch (e) {
    console.log('problem getting publisher information')
    console.log(e)
  }

  var btc = await $.ajax('/api/1/ledger_overview')
  var bat = await $.ajax('/api/1/bat/ledger_overview')
  window.OVERVIEW.ledger(btc, bat, builders)
}

var eyeshadeRetriever = function () {
  $.ajax('/api/1/eyeshade_wallets?' + standardParams(), {
    success: walletsTotalHandler
  })
}

var eyeshadeFundedRetriever = function () {
  $.ajax('/api/1/eyeshade_funded_wallets?' + standardParams(), {
    success: walletsTotalHandler
  })
}

var eyeshadeFundedPercentageRetriever = function () {
  $.ajax('/api/1/eyeshade_funded_percentage_wallets?' + standardParams(), {
    success: walletsHandler
  })
}

var eyeshadeFundedBalanceRetriever = function () {
  $.ajax('/api/1/eyeshade_funded_balance_wallets?' + standardParams(), {
    success: walletsCurrencyHandler
  })
}

const eyeshadeFundedBalanceAverageRetriever = function () {
  $.ajax('/api/1/eyeshade_funded_balance_average_wallets?' + standardParams(), {
    success: walletsBalanceAverageHandler
  })
}

var fillOptionsIfNotEmpty = function (url, id) {
  var select = $('#' + id)
  if (select.children().length <= 1) {
    $.ajax(url, {
      success: function (results) {
        results.forEach(function (item) {
          select.append('<option value=\'' + item + '\'>' + item + '</option>')
        })
      }
    })
  }
}

const dailyNewUsersRetriever = function () {
  $.ajax('/api/1/daily_new_users?' + standardParams(), {
    success: (data) => {
      dailyNewUsersHandler(data)
    }
  })
}

// Object of menu item meta data
var menuItems = {
  'mnSearch': {
    show: 'searchContent',
    title: 'Search',
    retriever: function () {} // TODO
  },
  'mnOverview': {
    show: 'overviewContent',
    title: 'Overview',
    retriever: overviewRetriever
  },
  'mnDNUDAURetention': {
    show: 'DNUDAUContent',
    title: 'Daily Retention',
    subtitle: 'Daily retention, calculated using the latest DAU and cumulative installations (DNU)',
    retriever: DNUDAURetriever
  },
  'mnRetention': {
    show: 'usageContent',
    title: 'Retention',
    retriever: retentionRetriever
  },
  'weeklyRetention': {
    show: 'weeklyRetentionContent',
    title: 'Weekly Retention',
    retriever: weeklyRetentionRetriever
  },
  'mnUsage': {
    show: 'usageContent',
    title: 'Daily Active Users by Platform (DAU)',
    retriever: DAUPlatformRetriever
  },
  'mnUsageReturning': {
    show: 'usageContent',
    title: 'Daily Returning Active Users by Platform (DAU)',
    retriever: DAUReturningPlatformRetriever
  },
  'mnDailyUsageStats': {
    show: 'statsContent',
    title: 'Daily Usage Stats',
    retriever: DUSRetriever
  },
  'mnUsageMonth': {
    show: 'usageContent',
    title: 'Monthly Active Users by Platform (MAU)',
    retriever: MAUPlatformRetriever
  },
  'mnUsageMonthAgg': {
    show: 'usageContent',
    title: 'Monthly Active Users (MAU)',
    retriever: MAUAggPlatformRetriever
  },
  'mnUsageMonthAverageAgg': {
    show: 'usageContent',
    title: 'Monthly Average Daily Active Users (MAU/DAU)',
    retriever: MAUAverageAggPlatformRetriever
  },
  'mnUsageMonthAverage': {
    show: 'usageContent',
    title: 'Monthly Average Daily Active Users by Platform (MAU/DAU)',
    retriever: MAUAveragePlatformRetriever
  },
  'mnUsageMonthAverageNewAgg': {
    show: 'usageContent',
    title: 'Monthly Average Daily New Users (MAU/DNU)',
    retriever: MAUAverageNewAggPlatformRetriever
  },
  'mnUsageMonthAverageNew': {
    show: 'usageContent',
    title: 'Monthly Average Daily New Users by Platform (MAU/DNU)',
    retriever: MAUAverageNewPlatformRetriever
  },
  'mnDailyNew': {
    show: 'usageContent',
    title: 'Daily New Users by Platform (DNU)',
    retriever: DNUPlatformRetriever
  },
  'mnUsageAgg': {
    title: 'Daily Active Users (DAU)',
    show: 'usageContent',
    retriever: DAURetriever
  },
  'mnVersions': {
    title: 'Daily Active Users by Version (DAU)',
    show: 'usageContent',
    retriever: versionsRetriever
  },
  'mnTopCrashes': {
    title: 'Top Crashes By Platform and Version',
    show: 'topCrashContent',
    retriever: topCrashesRetriever
  },
  'mnCrashRatio': {
    title: 'Crash Ratio By Platform and Version',
    show: 'crashRatioContent',
    retriever: crashRatioRetriever
  },
  'mnRecentCrashes': {
    title: 'Recent Crashes',
    show: 'recentCrashContent',
    retriever: recentCrashesRetriever
  },
  'mnDevelopmentCrashes': {
    title: 'Development Crashes',
    show: 'developmentCrashContent',
    subtitle: 'Most recent development crashes',
    retriever: developmentCrashesRetriever
  },
  'mnCrashes': {
    title: 'Daily Crashes by Platform',
    show: 'usageContent',
    retriever: crashesRetriever
  },
  'mnCrashesVersion': {
    title: 'Daily Crashes by Version',
    show: 'usageContent',
    retriever: crashesVersionRetriever
  },
  'mnCrashesDetail': {
    title: 'Crash Details',
    show: 'usageContent',
    retriever: crashesDetailRetriever
  },
  'mnEyeshade': {
    show: 'usageContent',
    title: 'Daily Ledger Wallets',
    subtitle: 'Number of ledger wallets created per day',
    retriever: eyeshadeRetriever
  },
  'mnFundedEyeshade': {
    show: 'usageContent',
    title: 'Daily Ledger Funded Wallets',
    subtitle: 'Number of funded ledger wallets created per day',
    retriever: eyeshadeFundedRetriever
  },
  'mnFundedPercentageEyeshade': {
    show: 'usageContent',
    title: 'Daily Ledger Funded Wallets Percentage',
    subtitle: 'Percentage of wallets created that are funded per day',
    retriever: eyeshadeFundedPercentageRetriever
  },
  'mnFundedBalanceEyeshade': {
    show: 'usageContent',
    title: 'Daily Ledger Funded Wallets Balance',
    subtitle: 'Total balance of funded wallets per day in USD ($)',
    retriever: eyeshadeFundedBalanceRetriever
  },
  'mnFundedBalanceAverageEyeshade': {
    show: 'usageContent',
    title: 'Daily Ledger Funded Wallets Average Balance',
    subtitle: 'Average balance of funded wallets per day in USD ($)',
    retriever: eyeshadeFundedBalanceAverageRetriever
  },
  'mnDailyPublishers': {
    show: 'publisherContent',
    title: 'Daily Publisher Status',
    subtitle: 'Publisher activations by day',
    retriever: window.STATS.PUB.publisherDailyRetriever
  },
  'mnDownloads': {
    show: 'usageContent',
    title: 'Downloads',
    subtitle: 'By Day',
    retriever: downloadsRetriever
  },
  'mnDailyNewUsers': {
    show: 'usageContent',
    title: 'Daily New Users (DNU)',
    subtitle: '',
    retriever: dailyNewUsersRetriever
  }
}

// Mutable page state
var pageState
pageState = window.localStorage.getItem('pageState') ? JSON.parse(window.localStorage.getItem('pageState')) : null

if (pageState) {
  // this is required for now. the control that displays the ref code cannot be programmatically controlled yet.
  pageState.ref = null
  pageState.countryCodes = null
  pageState.wois = null
} else {
  pageState = {
    currentlySelected: null,
    days: 14,
    version: null,
    ref: null,
    platformFilter: {
      'osx': true,
      'winx64': true,
      'winia32': true,
      'linux': true,
      'ios': true,
      'android': false,
      'androidbrowser': true,
      'osx-bc': true,
      'winx64-bc': true,
      'winia32-bc': true,
      'linux-bc': true
    },
    channelFilter: {
      'dev': true,
      'beta': false,
      'release': true
    },
    showToday: false,
    countryCodes: [],
    wois: []
  }
}

// initialized in globals section
let viewState = {}

$('#crash-ratio-versions').on('change', function (evt, value) {
  pageState.version = this.value
  refreshData()
})

// pageState view options to elements selector mappings
const controlSelectorMappings = {
  showControls: '#controls',
  showWOISFilter: '#woi_menu',
  showCountryCodeFilter: '#cc_menu',
  showDaysSelector: '#days-menu'
}

// Update page based on current state
const updatePageUIState = () => {

  // show / hide controls based on pageState
  _.each(controlSelectorMappings, (selector, attrib) => {
    if (viewState[attrib]) {
      $(selector).show()
    } else {
      $(selector).hide()
    }
  })

  // setup contents for sidebar item
  _.keys(menuItems).forEach((id) => {
    if (id !== pageState.currentlySelected) {
      $('#' + id).parent().removeClass('active')
    } else {
      $('#' + id).parent().addClass('active')
      $('#contentTitle').text(menuItems[id].title)
      $('#contentSubtitle').text(menuItems[id].subtitle || '')
    }
  })

  // show / hide main contents for a sidebar item
  contents.forEach((content) => {
    if (menuItems[pageState.currentlySelected].show === content) {
      $('#' + menuItems[pageState.currentlySelected].show).show()
    } else {
      $('#' + content).hide()
    }
  })

  const days = [10000, 365, 120, 90, 60, 30, 14, 7]

  // highlight currently selected days
  _.each(days, (d) => {
    if (pageState.days === d) {
      $(`#controls`).find(`a[data-days="${d}"] i`).removeClass('fa-blank')
    } else {
      $(`#controls`).find(`a[data-days="${d}"] i`).addClass('fa-blank')
    }
  })

  // highlight currently selected platforms
  _.each(pageState.platformFilter, (v, k, lst) => {
    if (v) {
      $(`#controls`).find(`a[data-platform="${k}"] i`).removeClass('fa-blank')
      $(`#controls`).find(`h5.platform-list span.${k}`).show()
    } else {
      $(`#controls`).find(`a[data-platform="${k}"] i`).addClass('fa-blank')
      $(`#controls`).find(`h5.platform-list span.${k}`).hide()
    }
  })

  // highlight currently selected channels
  _.each(pageState.channelFilter, (v, k, lst) => {
    if (v) {
      $(`#controls`).find(`a[data-channel="${k}"] i`).removeClass('fa-blank')
      $(`#controls`).find(`h5.platform-list span.${k}`).show()
    } else {
      $(`#controls`).find(`a[data-channel="${k}"] i`).addClass('fa-blank')
      $(`#controls`).find(`h5.platform-list span.${k}`).hide()
    }
  })

  // highlight selected country codes
  if (pageState.countryCodes && pageState.countryCodes.length > 0) {
    let label = pageState.countryCodes[0]
    if (pageState.countryCodes.length > 1) {
      label = pageState.countryCodes.length + ' countries'
    }
    $(`#controls`).find(`h5.platform-list span.countries`).text(label).show()
    $(`#controls`).find(`h5.platform-list span.countries`).tooltip({
    })
    $(`#controls`).find(`h5.platform-list span.countries`).attr('data-original-title', pageState.countryCodes.join(', '))
  } else {
    $(`#controls`).find(`h5.platform-list span.countries`).hide()
  }

  // highlight selected weeks of installation
  if (pageState.wois && pageState.wois.length > 0) {
    let label = pageState.wois[0]
    if (pageState.wois.length > 1) {
      label = pageState.wois.length + ' install weeks'
    }
    $(`#controls`).find(`h5.platform-list span.wois`).text(label).show()
  } else {
    $(`#controls`).find(`h5.platform-list span.wois`).hide()
  }

  // update menu label for days
  if (pageState.days === 10000) {
    $('#controls-selected-days').html('All days')
  } else {
    $('#controls-selected-days').html(pageState.days + ' days')
  }

  if (pageState.showToday) {
    $(`#controls`).find(`a[data-days="0"] i`).removeClass('fa-blank')
    $('#controls-selected-days').html($('#controls-selected-days').html() + ' + Now')
  } else {
    $(`#controls`).find(`a[data-days="0"] i`).addClass('fa-blank')
  }

  if (viewState.showShowToday) {
    $('#controls-days-menu').find('a[data-days="0"]').parent().show()
  } else {
    $('#controls-days-menu').find('a[data-days="0"]').parent().hide()
  }
}

const persistPageState = () => {
  window.localStorage.setItem('pageState', JSON.stringify(pageState))
}

let lastPageState = {}
const refreshData = () => {
  if (!_.isEqual(lastPageState, pageState)) {
    persistPageState()
    lastPageState = JSON.parse(JSON.stringify(pageState)) // deep clone
    if (menuItems[pageState.currentlySelected]) {
      menuItems[pageState.currentlySelected].retriever()
    }
  }
}

let initialize_router = () => {
  // Setup menu handler routes
  const router = new Grapnel()

  router.get('search', function (req) {
    pageState.currentlySelected = 'mnSearch'
    viewState.showControls = false
    viewState.showShowToday = false
    viewState.showRefFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('overview', function (req) {
    pageState.currentlySelected = 'mnOverview'
    viewState.showControls = false
    viewState.showShowToday = false
    viewState.showRefFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('versions', function (req) {
    pageState.currentlySelected = 'mnVersions'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('retention', function (req) {
    pageState.currentlySelected = 'mnRetention'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('weekly-retention', function (req) {
    pageState.currentlySelected = 'weeklyRetention'
    viewState.showControls = true
    viewState.showDaysSelector = false
    viewState.showShowToday = false
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('usage', function (req) {
    pageState.currentlySelected = 'mnUsage'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('usage_returning', function (req) {
    pageState.currentlySelected = 'mnUsageReturning'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('usage_month', (req) => {
    pageState.currentlySelected = 'mnUsageMonth'
    viewState.showControls = true
    viewState.showDaysSelector = false
    viewState.showShowToday = true
    viewState.showRefFilter = true
    viewState.showWOISFilter = false
    viewState.showCountryCodeFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('usage_month_agg', function (req) {
    pageState.currentlySelected = 'mnUsageMonthAgg'
    viewState.showControls = true
    viewState.showDaysSelector = false
    viewState.showShowToday = true
    viewState.showRefFilter = true
    viewState.showWOISFilter = false
    viewState.showCountryCodeFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('usage_month_average_agg', function (req) {
    pageState.currentlySelected = 'mnUsageMonthAverageAgg'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('usage_month_average', function (req) {
    pageState.currentlySelected = 'mnUsageMonthAverage'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('usage_month_average_new_agg', function (req) {
    pageState.currentlySelected = 'mnUsageMonthAverageNewAgg'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('usage_month_average_new', function (req) {
    pageState.currentlySelected = 'mnUsageMonthAverageNew'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('daily_new', function (req) {
    pageState.currentlySelected = 'mnDailyNew'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('daily_usage_stats', function (req) {
    pageState.currentlySelected = 'mnDailyUsageStats'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('usage_agg', function (req) {
    pageState.currentlySelected = 'mnUsageAgg'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('dnu_dau_retention', function (req) {
    pageState.currentlySelected = 'mnDNUDAURetention'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = true
    viewState.showWOISFilter = true
    viewState.showCountryCodeFilter = false
    updatePageUIState()
    refreshData()
  })

  router.get('top_crashes', function (req) {
    pageState.currentlySelected = 'mnTopCrashes'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    viewState.showRefFilter = false
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
    viewState.showShowToday = true
    viewState.showRefFilter = false
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
    viewState.showShowToday = true
    viewState.showRefFilter = false
    updatePageUIState()
    // refreshData()
  })

  router.get('crashes_platform_version', function (req) {
    pageState.currentlySelected = 'mnCrashesVersion'
    viewState.showControls = true
    viewState.showDaysSelector = true
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
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

  router.get('eyeshade_funded', function (req) {
    pageState.currentlySelected = 'mnFundedEyeshade'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

  router.get('eyeshade_funded_percentage', function (req) {
    pageState.currentlySelected = 'mnFundedPercentageEyeshade'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

  router.get('eyeshade_funded_balance', function (req) {
    pageState.currentlySelected = 'mnFundedBalanceEyeshade'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

  router.get('eyeshade_funded_balance_average', function (req) {
    pageState.currentlySelected = 'mnFundedBalanceAverageEyeshade'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

  router.get('daily_publishers', function (req) {
    pageState.currentlySelected = 'mnDailyPublishers'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

  router.get('dnu_dau_retention', function (req) {
    pageState.currentlySelected = 'mnDNUDAURetention'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showPromotions = false
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

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
    viewState.showShowToday = false
    updatePageUIState()
    refreshData()
  })

  router.get('daily_new_users', function (req) {
    pageState.currentlySelected = 'mnDailyNewUsers'
    viewState.showControls = true
    viewState.showDaysSelector = true
    viewState.showPromotions = false
    viewState.showShowToday = false
    viewState.showRefFilter = true
    viewState.showShowToday = true
    updatePageUIState()
    refreshData()
  })

}

var searchInputHandler = function (e) {
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
}

$('#searchText').on('input', _.debounce(searchInputHandler, 500))

$('#searchComments').hide()

window.SEARCH_LINKS.setup()

$('#monthly-averages-whats-this').on('click', function (e) {
  e.preventDefault()
  $('#monthly-averages-instructions').show('slow')
})

$(document).ajaxStart(function () {
  $('#hourglassIndicator').fadeIn(200)
}).ajaxStop(function () {
  $('#hourglassIndicator').fadeOut(200)
})

$('[data-toggle="tooltip"]').tooltip()

let publisherPlatforms
let publisherPlatformsByPlatform

async function loadInitialData () {
  publisherPlatforms = await $.ajax('/api/1/publishers/platforms')
  publisherPlatformsByPlatform = _.object(publisherPlatforms.map((platform) => { return [platform.platform, platform] }))
  $('#clearRef').hide()

  await window.REFERRAL.referralSummaryStatsRetriever()
}

function initializeGlobals () {
  viewState = {
    showControls: true,
    showDaysSelector: true,
    showRefFilter: false,
    showWOISFilter: false,
    showCountryCodeFilter: false
  }
}

initialize_components = () => {
  let campaigns = []
  const addCampaignClickListener = () => {
    setTimeout(function () {
      $('li[role=group]').on('click', (obj) => {
        let campaignName = $(obj.target).html()
        if (campaignName !== 'No Campaign') {
          let campaign = _.find(campaigns, {'name': campaignName})
          const current = $('#ref-filter').select2('data').map(i => i.text)
          $('#ref-filter').val(current.concat(campaign.referralCodes.map(r => r.code_text)))
          $('#ref-filter').trigger('change')
        }
      })
    }, 300)

  }
  $.ajax('/api/1/campaigns', {
    success: (response) => {
      campaigns = response
      let template = ''
      _.sortBy(response, 'name').map((c) => {
        let optgroup = `<optgroup label="${c.name}">`
        c.referralCodes.forEach((r) => { optgroup += `<option id=${r.id}>${r.code_text}</option>` })
        optgroup += '</optgroup>'
        template += optgroup
      })

      const ref_filter = $('#ref-filter')
      ref_filter.empty()
      ref_filter.append(template)
      ref_filter.select2({width: 300, placeholder: 'Campaign / referral codes'})
      $('body').bind('DOMSubtreeModified', async function () {
        const select = $('.select2-results__option[role=group]')
        if (select.length > 0) {
          if (select.hasClass('bound') === false) {
            select.addClass('bound')
            addCampaignClickListener()
          }
        }
      })
      ref_filter.on('change', function () {
        let referral_codes = []
        const ref_filter = $('#ref-filter')
        if (ref_filter.hasClass('select2-hidden-accessible')) {
          referral_codes = ref_filter.select2('data').map(i => i.id)
        }
        pageState.ref = referral_codes
        refreshData()
      })
      $('#clear-ref').on('click', function () {
        ref_filter.val(null).trigger('change')
      })
    }
  })
}

const setupControls = () => {
  $('#controls-days-menu').on('click', 'a', (evt) => {
    const target = $(evt.target)
    const days = parseInt(target.data('days'))
    if (days !== 0) {
      pageState.days = days
    } else {
      pageState.showToday = !pageState.showToday
    }
    updatePageUIState()
    refreshData()
  })

  $('#controls-channels-menu').on('click', 'a', (evt) => {
    const target = $(evt.target)
    const channel = target.data('channel')
    pageState.channelFilter[channel] = !pageState.channelFilter[channel]
    updatePageUIState()
    refreshData()
  })

  const productPlatforms = {
    muon: ['winx64', 'winia32', 'osx', 'linux'],
    core: ['winx64-bc', 'winia32-bc', 'osx-bc', 'linux-bc'],
    mobile: ['androidbrowser', 'ios', 'android']
  }

  let productMenuHandler = (evt) => {
    const target = $(evt.target)
    let platform = target.data('platform')
    if (platform.split(':').length === 1) {
      pageState.platformFilter[platform] = !pageState.platformFilter[platform]
    } else {
      let [product, action] = platform.split(':')
      if (action === 'all') {
        for (let plat of productPlatforms[product]) { pageState.platformFilter[plat] = true }
      }
      if (action === 'none') {
        for (let plat of productPlatforms[product]) { pageState.platformFilter[plat] = false }
      }
      if (action === 'only') {
        for (let prod of ['muon', 'core', 'mobile']) {
          if (prod === product) {
            for (let plat of productPlatforms[prod]) {
              pageState.platformFilter[plat] = true
            }
          } else {
            for (let plat of productPlatforms[prod]) {
              pageState.platformFilter[plat] = false
            }
          }
        }
      }
    }
    updatePageUIState()
    refreshData()
  }

  $('#controls-muon-menu').on('click', 'a', productMenuHandler)
  $('#controls-core-menu').on('click', 'a', productMenuHandler)
  $('#controls-mobile-menu').on('click', 'a', productMenuHandler)
}

// callback from brave-menu
$("#cc_menu").on("selection", (evt, countryCodes) => {
  pageState.countryCodes = countryCodes
  updatePageUIState()
  refreshData()
})

// callback from brave-menu
$("#woi_menu").on("selection", (evt, wois) => {
  pageState.wois = wois
  updatePageUIState()
  refreshData()
})

$(document).ready(function () {
  initializeGlobals()
  loadInitialData()
  setupControls()
  initialize_components()
  initialize_router()
})
