const $ = require('jquery')
const BaseReportComponent = require('../base-report-component')
const _ = require('lodash')
const {st} = require('../builders')
const STATS = require('../stats')
require('jquery-sparkline')
const {submit}= require('../remote-job')

class WeeklyRetention extends BaseReportComponent {
  constructor () {
    super()
    this.reportContent = `<marquee> this is a daily new users report </marquee>`
    this.menuId = 'weeklyRetention'
    this.menuTitle = 'Retention Week / Week'
    this.title = 'Retention Week / Week'
    this.subtitle = ''
    this.path = 'weekly-retention'
    this.contentTagId = 'weeklyRetentionContent'
    this.menuConfig.showDaysSelector = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showWOISFilter = true
  }

  async retriever () {
    const params = this.app.pageState.standardParams()
    let job = await submit('/api/1/retention_week?' + $.param(params), 1000)
    job.on('complete', (results) => {
      this.handler(results)
    })
  }

  valueFormatter (v) {
    if (v > 999) {
      return numeral(Math.round(v / 100) / 10).format('0,0.0') + 'k'
    } else {
      return numeral(v).format('0,0')
    }
  }

  async handler (rows) {

    const sparklineOptions = {
      width: '60px',
      height: '25px',
      disableInteraction: true,
      fillColor: '#efefef',
      lineColor: '#999999',
      chartRangeMin: 0,
      chartRangeMax: 100,
    }

    console.log('weeklyRetentionHandler')
    let i, row, cellColor, weekDelta
    let rowHeadings = []
    let buffer = ''

    console.log(rows)

    const baseColor = net.brehaut.Color('#ff5500')
    const baseColorAvg = net.brehaut.Color('#999999')

    // headings
    buffer += `<table class='table'>`
    buffer += `<tr class='active'><th colspan='2'>Weeks since installation</th>`
    for (i = 0; i < 12; i++) {
      buffer += `<th class='retentionCell'>${i + 1}</th>`
    }
    buffer += `</tr>`

    // heading sparklines
    buffer += `<tr><td></td>`
    for (i = 0; i < 12; i++) {
      buffer += `<td><span id="sparklineDelta${i}"></span></td>`
    }
    buffer += `<td></td></tr>`

    // averages
    buffer += '<tr><th>Average</th><td></td>'
    for (i = 1; i < 12; i++) {
      let avg = STATS.avg(rows.filter((row) => { return row.week_delta === i }).map((row) => { return row.retained_percentage })) || 0
      cellColor = baseColorAvg.desaturateByAmount(1 - avg).lightenByAmount((1 - avg) / 2.2)
      buffer += `<td style="background-color: ${cellColor}" class="retentionCell">${st(avg * 100)}</td>`
    }
    buffer += `<td style="background-color: ${cellColor}" class="retentionCell"></td>`
    buffer += `</tr>`

    // cell contents
    buffer += '<tr>'
    let ctrl = null
    for (i = 0; i < rows.length; i++) {
      row = rows[i]
      if (row.woi !== ctrl) {
        buffer += '</tr><tr>'
        buffer += `<td><span id='sparklineActual${row.woi}'></span><br>`
        buffer += `<th nowrap>${moment(row.woi).format('MMM D')}<br><small class="text-muted">${this.valueFormatter(row.starting)}</small></th>`
        rowHeadings.push(row.woi)
        ctrl = row.woi
        weekDelta = 0
      }
      weekDelta += 1
      cellColor = baseColor.desaturateByAmount(0.75 - row.retained_percentage).lightenByAmount((1 - row.retained_percentage) / 6.2)
      buffer += `
        <td style="background-color: ${cellColor}" class="retentionCell">
          <div class="retentionPercentage">${st(row.retained_percentage * 100)}</div>
          <div class="retentionkCount">${this.valueFormatter(row.current)}</div>
        </td>`
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
      let sparkData = rows.filter((row) => { return row.week_delta === i }).map((row) => { return parseInt(row.retained_percentage * 100) })
      $('#sparklineDelta' + i).sparkline(sparkData, sparklineOptions)
    }

    // installation week sparklines
    rowHeadings.forEach((heading) => {
      let sparkData = rows.filter((row) => { return row.woi === heading }).map((row) => { return parseInt(row.retained_percentage * 100) })
      $('#sparklineActual' + heading).sparkline(sparkData, sparklineOptions)
    })

    $(`#${this.contentTagId}`).show()
  }

}

module.exports = WeeklyRetention
