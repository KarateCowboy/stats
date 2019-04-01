const MenuConfig = require('./menu-config')
const _ = require('underscore')
const COLOR = require('./color')
const COMMON = require('./common')
const {
  round,
  td,
  ptd,
  th,
  tr,
  st,
  st1,
  st3,
  stp,
  b,
  std
} = require('./builders')
module.exports = class BaseReportComponent {
  constructor (app = null) {
    this.menuConfig = new MenuConfig()
    this.title = 'Basic Report'
    this.subtitle = 'Subtitle for basic report'
    this.path = 'basic_report_path'
    this.menuTitle = 'Basic Report Menu Title'
    this.menuId = 'basicReportId'
    this.reportContent = `<marquee>hello, Brave new world</marquee>`
    this.contentTagId = 'usageContent'
    this.app = app
  }

  static buildSuccessHandler (x, y, x_label, y_label, opts) {
    opts = opts || {}
    x_label = x_label || 'Date'
    y_label = y_label || 'Platform'
    opts.chartType = opts.chartType || 'line'

    var value_func = function (row, value) {
      var formatter = st
      if (opts.percentage) {
        formatter = stp
      } else if (opts.currency) {
        formatter = std
      }
      return formatter(value)
    }

    if (opts.formatter) {
      value_func = opts.formatter
    }

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
        rows.forEach((row) => {
          columns[row[y]] = true
        })
        columns = Object.keys(columns).sort()

        // get the list of the keys for each row
        let groups = _.groupBy(rows, (row) => {
          return row[x]
        })
        let ks = Object.keys(groups).sort((a, b) => {
          return b.localeCompare(a)
        })

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
          let rowTotal = _.reduce(groups[k], (memo, row) => {
            return memo + (row.count || 0)
          }, 0)
          for (let column of columns) {
            let record = groups[k].find((row) => {
              return row[y] === column
            })
            // if a row doesn't exist build a blank one
            if (!record) record = {
              count: 0
            }
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
        let averageGrowthRate = Math.pow(rows[rows.length - 1].count / rows[0].count, 1 / rows.length) - 1
        let averageGrowthRateDesc = 'Math.pow(' + rows[rows.length - 1].count + '/' + rows[0].count + ', 1 / ' + rows.length + ') - 1'
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

        for (let i = 1; i < 13; i++) {
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
        ], {
          classes: 'info'
        }))
      }

      // Build a list of unique labels (ymd)
      var labels = _.chain(rows)
        .map(function (row) {
          return row[x]
        })
        .uniq()
        .sort()
        .value()

      // Build a list of unique data sets (i.e. platform)
      var ys = _.chain(rows)
        .map(function (row) {
          return row[y]
        })
        .uniq()
        .value()

      // force ordering
      if (opts.datasetOrdering) ys = ys.sort(opts.datasetOrdering)

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
      var colourer = function (idx, opacity) {
        return COLOR.colorForLabel(ys[idx], opacity)
      }
      if (opts.colourBy === 'index') {
        colourer = function (idx, opacity) {
          return COLOR.colorForIndex(idx, opacity)
        }
      }
      if (opts.colourBy === 'hashedLabel') {
        colourer = (idx, opacity) => {
          return COLOR.colorForHashedLabel(ys[idx], opacity)
        }
      }

      var data = {
        labels: labels,
        datasets: _.map(datasets, function (dataset, idx) {
          return {
            label: ys[idx] || 'All',
            data: dataset,
            borderColor: colourer(idx, 1),
            pointColor: colourer(idx, 0.5),
            backgroundColor: colourer(idx, opts.chartType === 'line' ? 0.05 : 1)
          }
        })
      }

      let container = $('#usageChartContainer')
      container.empty()
      container.append('<canvas id=\'usageChart\' height=\'350\' width=\'800\'></canvas>')

      let usageChart = document.getElementById('usageChart')
      new Chart(
        usageChart.getContext('2d'), {
          type: opts.chartType,
          data: data,
          options: opts.chartType === 'line' ? COMMON.standardYAxisOptions : COMMON.standardYAxisOptionsBar
        }
      )
    }
  }

  static buildSingleValueChartHandler (chartContainerId, x, y, xLabel, yLabel, opts) {
    opts = opts || {}
    opts.valueClamper = opts.valueClamper || _.identity
    opts.colorIdx = opts.colorIdx || 0

    return (rows) => {
      if (opts.valueManipulator) rows = rows.map(opts.valueManipulator)

      // Build a list of unique x-axis labels (mostly ymd)
      var labels = _.chain(rows)
        .map((row) => {
          return row[x]
        })
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
        return COLOR.colorForIndex(idx, opacity)
      }

      var data = {
        labels: labels,
        datasets: [{
          label: yLabel,
          data: dataset,
          borderColor: colourer(opts.colorIdx, 1),
          pointColor: colourer(opts.colorIdx, 0.5),
          backgroundColor: colourer(opts.colorIdx, 0.05)
        }]
      }

      let container = $('#' + chartContainerId)
      let chartId = chartContainerId + 'Chart'
      container.empty()
      container.append(`<canvas id='${chartId}' height='300' width='800'></canvas>`)

      var usageChart = document.getElementById(chartId)
      new Chart.Line(usageChart.getContext('2d'), {
        data: data,
        options: COMMON.standardYAxisOptions
      })
    }
  }

  async retriever () {
    console.log('running basic retriever stub')

  }

  handler () {}

  forceOrganicOrdering (a, b) {
    if (a === 'Organic') return -1
    if (b === 'Organic') return 1
    return a.localeCompare(b)
  }
}