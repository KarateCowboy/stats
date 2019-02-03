// Platform meta data
var VueApp
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

var reversePlatforms = _.object(_.map(platforms, function (platform) { return [platform.label, platform] }))

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

var buildTelemetryChartBuilder = function (opts) {
  opts = opts || {}

  var grouperLabel = function (row) {
    return [row.platform, row.version, row.channel, row.machine, row.measure].join('-')
  }

  return function (rows) {
    // Build a list of unique labels (ymd)
    var ymds = _.chain(rows)
      .map(function (row) { return row.ymd })
      .uniq()
      .sort()
      .value()

    // Build a list of unique data sets (platform)
    var ys = _.chain(rows)
      .map(function (row) { return grouperLabel(row) })
      .uniq()
      .value()

    var groups = _.groupBy(rows, function (row) {
      return grouperLabel(row)
    })

    // Associate the data
    var product = _.object(_.map(ymds, function (ymd) {
      return [ymd, {}]
    }))
    rows.forEach(function (row) {
      if (!product[row.ymd][grouperLabel(row)]) product[row.ymd][grouperLabel(row)] = {}
      product[row.ymd][grouperLabel(row)].average = row.average
      product[row.ymd][grouperLabel(row)].minimum = row.minimum
      product[row.ymd][grouperLabel(row)].maximum = row.maximum
      product[row.ymd][grouperLabel(row)].quant25 = row.quant25
      product[row.ymd][grouperLabel(row)].quant75 = row.quant75
    })

    var opacityByIndex = function (idx) {
      return {
        0: 0.05,
        1: 0.2,
        2: 1,
        3: 0.2,
        4: 0.05
      }[idx]
    }

    var datasets = []
    var labels = []
    var measureCount = 0
    _.each(groups, function (groupedRows, k) {
      ['minimum', 'quant25', 'average', 'quant75', 'maximum'].map(function (fld, idx) {
        labels.push({
          label: k + '-' + fld,
          idx: measureCount,
          opacity: opacityByIndex(idx)
        })
        datasets.push(_.map(ymds, function (ymd, idx) {
          return product[ymd][k][fld]
        }))
      })
      measureCount += 1
    })

    var regressionData = _.map(datasets[0], function (v, idx) { return [idx, v] })
    console.log(ss.linearRegression(regressionData))

    var data = {
      labels: ymds,
      datasets: _.map(datasets, function (dataset, idx) {
        return {
          label: labels[idx].label,
          data: dataset,
          borderColor: window.STATS.COLOR.colorForIndex(labels[idx].idx, labels[idx].opacity),
          fill: false
        }
      })
    }

    var container = $('#telemetryChartContainer')
    container.empty()
    container.append('<canvas id=\'telemetryUsageChart\' height=\'350\' width=\'800\'></canvas>')

    var chartOptions = _.extend(_.clone(window.STATS.COMMON.standardYAxisOptions), {
      onClick: function (evt, points) {
        if (points.length) {
          var ymd = points[0]._xScale.ticks[points[0]._index]
          $.ajax('/api/1/ci/telemetry/' + ymd + '?' + standardTelemetryParams(), {
            success: function (results) {
              // detailed telemetry items
              console.log(results)
            }
          })
        }
      }
    })

    var usageChart = document.getElementById('telemetryUsageChart')
    new Chart.Line(usageChart.getContext('2d'), {data: data, options: chartOptions})
  }
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

    $('#x_label').html(x_label)
    $('#y_label').html(y_label)

    table.empty()
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

const weeklyRetentionHandler = async function (rows) {
  const missingData = await $.ajax('/api/1/retention/missing')
  const retention_warnings = missingData || []

  console.log('executed the weeklyRetentionHandler')
  let i, row, cellColor, weekDelta
  let rowHeadings = []
  let buffer = ''
  const baseColor = net.brehaut.Color('#ff5500')
  const baseColorAvg = net.brehaut.Color('#999999')
  const sparklineOptions = {
    width: '60px',
    height: '25px',
    disableInteraction: true,
    fillColor: '#efefef',
    lineColor: '#999999'
  }

  //prepend any warnings about incomplete data
  buffer += `<table class="table" id="missingRetentionWarnings">`
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
  for (let platform in retention_warnings) {
    retention_warnings[platform] = retention_warnings[platform].filter((p) => { return p !== yesterday})
    if (retention_warnings[platform].length > 0) {
      const message_string = `Missing ${ platform } data: ${retention_warnings[platform].sort().reverse().splice(0, 5).join(', ')}`
      buffer += `<tr><td style="color: red">${message_string}</td>`
    }
  }
  buffer += `</table>`

  // headings

  buffer += '<table class=\'table\'>'
  buffer += '<tr class=\'active\'><th colspan=\'2\'>Weeks since installation</th>'
  buffer += `<th></th>`
  for (i = 0; i < 12; i++) {
    buffer += '<th class="retentionCell">' + i + '</th>'
  }

  // heading sparklines
  buffer += '</tr><tr><td></td><td></td><td></td>'
  for (i = 0; i < 12; i++) {
    buffer += '<td><span id=\'sparklineDelta' + i + '\'></span></td>'
  }

  // averages
  buffer += '</tr><tr><th>Average</th><td></td>'
  for (i = 0; i < 12; i++) {
    avg = STATS.STATS.avg(rows.filter((row) => { return row.week_delta === i }).map((row) => { return row.retained_percentage })) || 0
    cellColor = baseColorAvg.desaturateByAmount(1 - avg).lightenByAmount((1 - avg) / 2.2)
    buffer += '<td style=\'background-color: ' + cellColor + '\' class=\'retentionCell\'>' + st(avg * 100) + '</td>'
  }

  // cell contents
  buffer += '</tr><tr>'
  let ctrl = null
  for (i = 0; i < rows.length; i++) {
    row = rows[i]
    if (row.woi !== ctrl) {
      buffer += '</tr><tr>'
      buffer += '<th nowrap>' + moment(row.woi).format('MMM DD YYYY') + '</th>'
      let key = row.woi.substring(0, 10)
      buffer += '<td><span id=\'sparklineActual' + row.woi + '\'></span><br>'
      rowHeadings.push(row.woi)
      ctrl = row.woi
      weekDelta = 0
    }
    weekDelta += 1
    cellColor = baseColor.desaturateByAmount(1 - row.retained_percentage).lightenByAmount((1 - row.retained_percentage) / 6.2)
    buffer += `<td style="background-color: ${cellColor}" class="retentionCell">${st(row.retained_percentage * 100)} </td>`
  }
  buffer += '<td><span id=\'sparklineDelta' + weekDelta + '\'></span><br>'
  buffer += '</tr>'
  buffer += '</table>'

  // insert elements
  const div = $('#weeklyRetentionTableContainer')
  div.empty()
  div.append(buffer)

  // heading sparklines
  for (i = 0; i < 12; i++) {
    sparkData = rows.filter((row) => { return row.week_delta === i }).map((row) => { return parseInt(row.retained_percentage * 100) })
    $('#sparklineDelta' + i).sparkline(sparkData, sparklineOptions)
  }

  // installation week sparklines
  rowHeadings.forEach((heading) => {
    sparkData = rows.filter((row) => { return row.woi === heading }).map((row) => { return parseInt(row.retained_percentage * 100) })
    $('#sparklineActual' + heading).sparkline(sparkData, sparklineOptions)
  })
  console.log('finished the weeklyRetentionHandler')
}

const retentionMonthHandler = function (rows) {
  console.log('executed the retentionMonthHandler')
  let i, row, cellColor, monthDelta
  let rowHeadings = []
  let buffer = ''
  const baseColor = net.brehaut.Color('#ff5500')
  const baseColorAvg = net.brehaut.Color('#999999')
  const sparklineOptions = {
    width: '60px',
    height: '25px',
    disableInteraction: true,
    fillColor: '#efefef',
    lineColor: '#999999'
  }

  // headings
  buffer += '<table class=\'table\'>'
  buffer += '<tr class=\'active\'><th colspan=\'2\'>Months from installation</th>'
  for (i = 0; i < 12; i++) {
    buffer += '<th class="retentionCell">' + i + '</th>'
  }

  // heading sparklines
  buffer += '</tr><tr><td></td><td></td>'
  for (i = 0; i < 12; i++) {
    buffer += '<td><span id=\'sparklineDelta' + i + '\'></span></td>'
  }

  // averages
  buffer += '</tr><tr><th>Average</th><td></td>'
  for (i = 0; i < 12; i++) {
    avg = STATS.STATS.avg(rows.filter((row) => { return row.month_delta === i }).map((row) => { return row.retained_percentage })) || 0
    cellColor = baseColorAvg.desaturateByAmount(1 - avg).lightenByAmount((1 - avg) / 2.2)
    buffer += '<td style=\'background-color: ' + cellColor + '\' class=\'retentionCell\'>' + st(avg * 100) + '</td>'
  }

  // cell contents
  buffer += '</tr><tr>'
  let ctrl = null
  console.log(`length of rows is ${rows.length}`)
  for (i = 0; i < rows.length; i++) {
    row = rows[i]
    if (row.moi !== ctrl) {
      buffer += '</tr><tr>'
      buffer += '<th nowrap>' + moment(row.moi).format('MMM YYYY') + '</th>'
      buffer += '<td><span id=\'sparklineActual' + row.moi + '\'></span><br>'
      rowHeadings.push(row.moi)
      ctrl = row.moi
      monthDelta = 0
    }
    monthDelta += 1
    cellColor = baseColor.desaturateByAmount(1 - row.retained_percentage).lightenByAmount((1 - row.retained_percentage) / 6.2)
    buffer += '<td style=\'background-color: ' + cellColor + '\' class=\'retentionCell\'>' + st(row.retained_percentage * 100) + '</td>'
  }
  buffer += '<td><span id=\'sparklineDelta' + monthDelta + '\'></span><br>'
  buffer += '</tr>'
  buffer += '</table>'

  // insert elements
  const div = $('#retentionMonthTableContainer')
  div.empty()
  div.append(buffer)

  // heading sparklines
  for (i = 0; i < 12; i++) {
    sparkData = rows.filter((row) => { return row.month_delta === i }).map((row) => { return parseInt(row.retained_percentage * 100) })
    $('#sparklineDelta' + i).sparkline(sparkData, sparklineOptions)
  }

  // installation month sparklines
  rowHeadings.forEach((heading) => {
    sparkData = rows.filter((row) => { return row.moi === heading }).map((row) => { return parseInt(row.retained_percentage * 100) })
    $('#sparklineActual' + heading).sparkline(sparkData, sparklineOptions)
  })
}

const downloadsHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})

const dailyNewUsersHandler = buildSuccessHandler('ymd', 'platform')

var usagePlatformHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})

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

var usageVersionHandler = buildSuccessHandler('ymd', 'version', 'Date', 'Version', {colourBy: 'index'})

var usageCrashesHandler = buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})

var telemetryHandler = buildTelemetryChartBuilder('ymd')

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
  'usageTelemetry',
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

var standardParams = function () {
  let referral_codes = VueApp && viewState.showRefFilter ? VueApp.$data.selected_refs.join(',') : null
  return $.param({
    days: pageState.days,
    platformFilter: serializePlatformParams(),
    channelFilter: serializeChannelParams(),
    showToday: pageState.showToday,
    version: pageState.version,
    ref: referral_codes
  })
}

var standardTelemetryParams = function () {
  return $.param({
    days: pageState.days,
    platformFilter: serializePlatformParams(),
    channelFilter: serializeChannelParams(),
    showToday: pageState.showToday,
    version: pageState.version,
    measure: pageState.measure,
    machine: pageState.machine
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

var retentionMonthRetriever = function () {
  $.ajax('/api/1/retention_month?' + standardParams(), {
    success: (rows) => {
      retentionMonthHandler(rows)
    }
  })
}

const weeklyRetentionRetriever = async function () {
  const standard_params = standardParams()
  return new Promise((resolve, reject) => {
    $.ajax('/api/1/retention_week?' + standard_params, {
      success: (rows) => {
        weeklyRetentionHandler(rows)
        resolve()
      },
      error: () => {
        console.log('failed to communicate with endpoint')
        reject()
      }
    })
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
  console.log('executing the downloads retriever')
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
    success: usagePlatformHandler
  })
}

var MAUAveragePlatformRetriever = function () {
  $.ajax('/api/1/dau_monthly_average_platform?' + standardParams(), {
    success: usagePlatformHandler
  })
}

var MAUAverageNewAggPlatformRetriever = function () {
  $.ajax('/api/1/dau_first_monthly_average?' + standardParams(), {
    success: usagePlatformHandler
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
    success: usagePlatformHandler
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

var telemetryRetriever = function () {
  $.ajax('/api/1/ci/telemetry?' + standardTelemetryParams(), {
    success: telemetryHandler
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

var telemetryStandardRetriever = function () {
  fillOptionsIfNotEmpty('/api/1/ci/measures', 'measures')
  fillOptionsIfNotEmpty('/api/1/ci/machines', 'machines')
  fillOptionsIfNotEmpty('/api/1/ci/versions', 'telemetryVersions')
  telemetryRetriever()
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
  'mnRetentionMonth': {
    show: 'retentionMonthContent',
    title: 'Retention Month over Month',
    retriever: retentionMonthRetriever
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
  'mnTelemetryStandard': {
    show: 'usageTelemetry',
    title: 'Telemetry Navigator',
    subtitle: 'Browser telemetry by measure, machine and version',
    retriever: telemetryStandardRetriever
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
var pageState;
pageState = window.localStorage.getItem('pageState') ? JSON.parse(window.localStorage.getItem('pageState')) : null

if (!pageState) {
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
    showToday: false
  }
}

console.log(pageState)

var viewState = {
  showControls: true,
  platformEnabled: {
    'osx': true,
    'winx64': true,
    'winia32': true,
    'linux': true,
    'ios': true,
    'android': true,
    'androidbrowser': true,
    'osx-bc': true,
    'winia32-bc': true,
    'winx64-bc': true,
    'linux-bc': true
  },
  showRefFilter: false
}

var enableAllPlatforms = function () {
  viewState.platformEnabled = {
    osx: true,
    winx64: true,
    winia32: true,
    linux: true,
    ios: true,
    android: true,
    androidbrowser: true,
    'osx-bc': true,
    'winx64-bc': true,
    'winia32-bc': true,
    'linux-bc': true
  }
}

var disableAllPlatforms = function () {
  viewState.platformEnabled = {
    osx: false,
    winx64: false,
    winia32: false,
    linux: false,
    ios: false,
    android: false,
    androidbrowser: false,
    'osx-bc': false,
    'winx64-bc': false,
    'winia32-bc': false,
    'linux-bc': false
  }
}

var enableDesktopPlatforms = function () {
  viewState.platformEnabled.osx = true
  viewState.platformEnabled.winia32 = true
  viewState.platformEnabled.winx64 = true
  viewState.platformEnabled.linux = true
  viewState.platformEnabled['osx-bc'] = true
  viewState.platformEnabled['winx64-bc'] = true
  viewState.platformEnabled['winia32-bc'] = true
  viewState.platformEnabled['linux-bc'] = true
}

var disableDesktopPlatforms = function () {
  viewState.platformEnabled.osx = false
  viewState.platformEnabled.winia32 = false
  viewState.platformEnabled.winx64 = false
  viewState.platformEnabled.linux = false
  viewState.platformEnabled['osx-bc'] = false
  viewState.platformEnabled['winx64-bc'] = false
  viewState.platformEnabled['winia32-bc'] = false
  viewState.platformEnabled['linux-bc'] = false
}

var enableMobilePlatforms = function () {
  viewState.platformEnabled.ios = true
  viewState.platformEnabled.android = true
  viewState.platformEnabled.androidbrowser = true
}

var disableMobilePlatforms = function () {
  viewState.platformEnabled.ios = false
  viewState.platformEnabled.android = false
  viewState.platformEnabled.androidbrowser = false
}

$('#daysSelector').on('change', function (evt, value) {
  pageState.days = parseInt(this.value, 10)
  refreshData()
})

$('#machines').on('change', function (evt, value) {
  pageState.machine = this.value
  refreshData()
})

$('#measures').on('change', function (evt, value) {
  pageState.measure = this.value
  refreshData()
})

$('#telemetryVersions').on('change', function (evt, value) {
  pageState.version = this.value
  refreshData()
})

$('#crash-ratio-versions').on('change', function (evt, value) {
  pageState.version = this.value
  refreshData()
})

// Update page based on current state
const updatePageUIState = () => {
  $('#controls').show()

  _.keys(menuItems).forEach(function (id) {
    if (id !== pageState.currentlySelected) {
      $('#' + id).parent().removeClass('active')
    } else {
      $('#' + id).parent().addClass('active')
      $('#contentTitle').text(menuItems[id].title)
      $('#contentSubtitle').text(menuItems[id].subtitle || '')
    }
  })

  contents.forEach(function (content) {
    if (menuItems[pageState.currentlySelected].show === content) {
      $('#' + menuItems[pageState.currentlySelected].show).show()
    } else {
      $('#' + content).hide()
    }
  })

  if (viewState.showControls) {
    $('#controls').show()
  } else {
    $('#controls').hide()
  }

  if (viewState.showDaysSelector) {
    $("#controls-days-menu").parent().show()
  } else {
    $("#controls-days-menu").parent().hide()
  }

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

  // update menu label for days
  if (pageState.days === 10000) {
    $("#controls-selected-days").html("All days")
  } else {
    $("#controls-selected-days").html(pageState.days + " days")
  }

  if (pageState.showToday) {
    $(`#controls`).find(`a[data-days="0"] i`).removeClass('fa-blank')
    $("#controls-selected-days").html($("#controls-selected-days").html() + ' + Now')
  } else {
    $(`#controls`).find(`a[data-days="0"] i`).addClass('fa-blank')
  }

  if (viewState.showShowToday) {
    $("#controls-days-menu").find('a[data-days="0"]').parent().show()
  } else {
    $("#controls-days-menu").find('a[data-days="0"]').parent().hide()
  }
}

const persistPageState = () => {
  window.localStorage.setItem('pageState', JSON.stringify(pageState))
}

// Load data for the selected item
const refreshData = () => {
  persistPageState()
  if (menuItems[pageState.currentlySelected]) {
    menuItems[pageState.currentlySelected].retriever()
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
    VueApp.$data.showRefFilter = true
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

  router.get('retention_month', function (req) {
    pageState.currentlySelected = 'mnRetentionMonth'
    viewState.showControls = true
    viewState.showDaysSelector = false
    viewState.showShowToday = true
    viewState.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('weekly-retention', function (req) {
    pageState.currentlySelected = 'weeklyRetention'
    viewState.showControls = true
    viewState.showDaysSelector = false
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
    viewState.showShowToday = true
    viewState.showRefFilter = true
    VueApp.$data.showRefFilter = true
    updatePageUIState()
    refreshData()
  })

  router.get('dnu_dau_retention', function (req) {
    pageState.currentlySelected = 'mnDNUDAURetention'
    viewState.showControls = true
    viewState.showDaysSelector = true
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

  router.get('telemetry_standard', function (req) {
    pageState.currentlySelected = 'mnTelemetryStandard'
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
    VueApp.$data.showRefFilter = true
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
let referral_codes = []

async function loadInitialData () {
  publisherPlatforms = await $.ajax('/api/1/publishers/platforms')
  publisherPlatformsByPlatform = _.object(publisherPlatforms.map((platform) => { return [platform.platform, platform] }))
  const response = await $.ajax('/api/1/referral_codes')
  response.forEach(code => {
    referral_codes.push(code.code_text)
  })
  $('#clearRef').hide()

  await window.REFERRAL.referralSummaryStatsRetriever()
}

function initializeGlobals () {
  viewState = {
    showControls: true,
    platformEnabled: {
      osx: true,
      winx64: true,
      winia32: true,
      linux: true,
      ios: true,
      android: true,
      androidbrowser: true,
      'osx-bc': true,
      'winx64-bc': true,
      'winia32-bc': true,
      'linux-bc': true
    },
    showRefFilter: false
  }
}

function initialize_components () {
  Vue.component('v-select', VueSelect.VueSelect)
  VueApp = new Vue({
    el: '#ref-filter',
    components: {VueSelect},
    data: {
      showRefFilter: viewState.showRefFilter,
      selected_refs: [],
      refcodes: referral_codes
    },
    methods: {
      refresh_data: () => { refreshData() }
    }
  })
}

const setupControls = () => {
  $("#controls-days-menu").on("click", "a", (evt) => {
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

  $("#controls-channels-menu").on("click", "a", (evt) => {
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
      if (action === "all") {
        for (let plat of productPlatforms[product]) { pageState.platformFilter[plat] = true }
      }
      if (action === "none") {
        for (let plat of productPlatforms[product]) { pageState.platformFilter[plat] = false }
      }
      if (action === "only") {
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

  $("#controls-muon-menu").on("click", "a", productMenuHandler)
  $("#controls-core-menu").on("click", "a", productMenuHandler)
  $("#controls-mobile-menu").on("click", "a", productMenuHandler)
}

$(document).ready(function () {
  initializeGlobals()
  loadInitialData()
  setupControls()
  initialize_components()
  initialize_router()
})
