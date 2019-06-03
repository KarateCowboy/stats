const BaseReportComponent = require('../base-report-component')
const COLOR = require('../color')
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
} = require('../builders')

class ThirtyDayRetention extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Referral Promo 30 Day Confirmations'
    this.subtitle = 'Downloads, installs and 30 day confirmations by day'
    this.path = '30day-retention'
    this.menuTitle = '30 Day Retention'
    this.menuId = '30dayRetention'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'usageContent'
    this.menuConfig.showChannel = false
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false

  }

  async retriever () {
    const results = await $.ajax('/api/1/retention_30day?' + $.param(this.app.pageState.standardParams()))
    await this.handler(results)
  }

  async handler (rows) {
    const handler = this.build30DayRetentionChartHandler('usageChartContainer', {})
    handler(rows)
    $(`#${this.contentTagId}`).show()

  }

  build30DayRetentionChartHandler (chartContainerId, opts) {
    chartContainerId = chartContainerId || 'usageChartContainer'
    opts = opts || {}

    return (rows) => {
      // Build a list of unique x-axis labels (mostly ymd)
      var labels = _.chain(rows)
        .map((row) => { return row.ymd })
        .uniq()
        .sort()
        .value()

      let colourer = (idx, opacity) => {
        return COLOR.colorForIndex(idx, opacity)
      }

      const downloadsDataset = {
        label: 'Downloads',
        data: rows.map((row) => { return row.downloads }),
        borderColor: colourer(0, 1),
        pointColor: colourer(0, 0.5),
        backgroundColor: colourer(0, 0.05),
        type: 'line',
        yAxisID: 'A'
      }

      const installsDataset = {
        label: 'Installs',
        data: rows.map((row) => { return row.installs }),
        borderColor: colourer(1, 1),
        pointColor: colourer(1, 0.5),
        backgroundColor: colourer(1, 0.05),
        type: 'line',
        yAxisID: 'A'
      }

      const confirmationsDataset = {
        label: 'Confirmation %',
        data: rows.map((row) => { return row.confirmations ? row.confirmations / row.installs * 100 : 0 }),
        borderColor: colourer(2, 1),
        pointColor: colourer(2, 0.5),
        backgroundColor: colourer(2, 0.55),
        type: 'bar',
        yAxisID: 'B'
      }

      var data = {
        labels: labels,
        datasets: [
          downloadsDataset,
          installsDataset,
          confirmationsDataset
        ]
      }

      let container = $('#' + chartContainerId)
      let chartId = chartContainerId + 'Chart'
      container.empty()
      container.append(`<canvas id='${chartId}' height='300' width='800'></canvas>`)

      const axes = {
        tooltips: {
          mode: 'x',
          position: 'nearest'
        },
        scales: {
          yAxes: [{
            id: 'A',
            scaleLabel: {
              display: true,
              fontColor: colourer(0, 1),
              labelString: 'Downloads / Installs'
            },
            gridLines: {
              drawBorder: false,
              drawOnChartArea: true,
            },
            position: 'right',
            ticks: {
              fontColor: colourer(0, 1),
              beginAtZero: true
            }
          },
            {
              id: 'B',
              scaleLabel: {
                display: true,
                fontColor: colourer(2, 1),
                labelString: 'Confirmation %'
              },
              gridLines: {
                drawBorder: false,
                drawOnChartArea: false,
              },
              position: 'left',
              ticks: {
                fontColor: colourer(2, 1),
                suggestedMax: 100,
                max: 100,
                min: 0,
                beginAtZero: true
              }
            }
          ]
        }
      }

      var usageChart = document.getElementById(chartId)
      new Chart(usageChart.getContext('2d'), {
        type: 'bar',
        data: data,
        options: axes
      })

      const table = $('#usageDataTable tbody')

      table.empty()
      let tableHeader = table.parent().find('thead')
      tableHeader.empty()
      tableHeader.html(`<tr><th class="text-left">Date</th><th class="text-right">Downloads</th><th class="text-right">Installs</th><th class="text-right">Confirmations</th><th class="text-right">%</th></tr>`)

      rows.forEach((row) => {
        const percentage = row.installs > 0 ?
          row.confirmations / row.installs :
          0
        var buf = '<tr>'
        buf = buf + `<td>${row.ymd}</td>`
        buf = buf + `<td class="text-right">${st(row.downloads)}</td>`
        buf = buf + `<td class="text-right">${st(row.installs)}</td>`
        buf = buf + `<td class="text-right">${st(row.confirmations)}</td>`
        buf = buf + `<td class="text-right">${stp(percentage)}</td>`
        buf = buf + '</tr>'
        table.append(buf)
      })

    }
  }
}

module.exports = ThirtyDayRetention
