const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const _ = require('underscore')
const moment = require('moment')
const {st} = require('../builders')
const {submit}= require('../remote-job')

class CountryRetention extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Country Retention by Week'
    this.subtitle = 'Comparison of total installations to largest daily usage in subsquent weeks'
    this.path = 'country_retention'
    this.menuTitle = 'Retention by Country'
    this.menuId = 'countryRetention'
    this.reportContent = ``
    this.contentTagId = 'countryRetentionContent'
    this.csvFilename = 'weekly-retention-by-country'
    this.csvDownloadable = true
    this.menuConfig.showSource = true
    this.menuConfig.showWOISFilter = true
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showDaysSelector = false
  }

  async retriever () {
    $('#countryRetentionTableContainer').empty()
    $('#countryRetentionContent').show()
    setTimeout(() => {
      $('#WeeklyCountryRetentionInstructions').fadeOut()
    }, 10000)

    const params = this.app.pageState.standardParams()
    let job = await submit('/api/1/retention_cc?' + $.param(params), 1000, 10 * 60 * 1000)
    job.on('complete', (results) => {
      this.handler(results, params.wois.split(','))
    })
  }

  valueFormatter (v) {
    if (v > 999) {
      return numeral(Math.round(v / 100) / 10).format('0,0.0') + 'k'
    } else {
      return numeral(v).format('0,0')
    }
  }

  handler (data, wois) {
    console.log(data, wois)
    const weeks = _.uniq(_.pluck(data.dau, 'week_start')).sort()
    const ccs = _.uniq(_.pluck(data.dau, 'cc')).sort()
    const startAt = wois.sort().reverse()[0]

    const baseColor = net.brehaut.Color('#ff5500')
    const baseColorAd = net.brehaut.Color('#0099ff')

    const colorForRetention = (base, retention) => {
      return base.desaturateByAmount(0.65).lightenByAmount((1 - retention) / 5.2)
    }

    _.each(data.dnu, (row) => {
      if (data.countries[row.cc]) {
        row.label = data.countries[row.cc].label
        row.adCountry = data.countries[row.cc].adCountry
        row.count = parseInt(row.count)
      } else {
        console.log(`unknown country code ${row.cc}`)
      }
    })
    data.dnu.sort((a, b) => {
      return b.count - a.count
    })
    let buf = ``
    let csvRows = []
    let csvHeader = []
    buf += `<table class='table' id="retention-table">`
    buf += `<tr><th></th><th>Installs</th>`
    csvHeader.push('Country')
    csvHeader.push('Installs')
    let ctrlWeek = moment(startAt).add(7, 'days')
    let weekCounter = 1
    while (ctrlWeek.isBefore(moment().subtract(7, 'days'))) {
      buf += `<th style='text-align: center'><div class="retentionPercentage">${weekCounter}</div><div class="retentionCount">${ctrlWeek.format('MMM DD')}</div></th>`
      csvHeader.push(`${weekCounter} - ${ctrlWeek.format('MMM DD')}`)
      ctrlWeek.add('7', 'days')
      weekCounter += 1
    }
    buf += `</tr>`
    csvRows.push(csvHeader)

    _.each(data.dnu, (row) => {
      let csvDetail = []
      if (row.label) row.label = row.label.replace(/,/g, ' ')
      buf += `<tr>`
      buf += `<td style="background-color: ${row.adCountry ? colorForRetention(baseColorAd, 0.25) : colorForRetention(baseColor, 0.25)}">
        <div class="retentionPercentage" style="text-align: right; vertical-align: middle;">${row.label}</div>
      </td>`
      buf += `<td class="retentionInstalls">${this.valueFormatter(row.count)}</td>`
      csvDetail.push(row.label)
      csvDetail.push(row.count)
      // for each week
      let ctrlWeek = moment(startAt).add(7, 'days')
      while (ctrlWeek.isBefore(moment())) {
        const v = _.find(data.dau, (dauRow) => {
          return dauRow.cc === row.cc && dauRow.week_start === ctrlWeek.format('YYYY-MM-DD')
        })
        if (v) {
          const DAU = parseInt(v.count)
          const DNU = row.count
          csvDetail.push(DAU)
          const retention = DAU / DNU
          let cellBaseColor = row.adCountry ? baseColorAd : baseColor
          let cellColor = cellBaseColor.desaturateByAmount(0.75 - retention).lightenByAmount((1 - retention) / 6.2)
          buf += `<td class="retentionCell" style="background-color: ${cellColor}">
            <div class="retentionPercentage">${st(retention * 100)}</div>
            <div class="retentionCount">${this.valueFormatter(DAU)}</div>
          </td>`
        }
        ctrlWeek.add('7', 'days')
      }
      csvRows.push(csvDetail)
      buf += `</tr>`
    })
    buf += `</table>`

    const div = $('#countryRetentionTableContainer')
    div.empty()
    div.append(buf)

    $("#downloadRetentionCSV").unbind()
    $("#downloadRetentionCSV").on('click', () => {
      this.downloadCSV()
    })

    this.csvData = csvRows
    $(`#${this.contentTagId}`).show()
  }
}

module.exports = CountryRetention
