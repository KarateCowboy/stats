const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const moment = require('moment')
const {round, td, ptd, th, tr, st, st1, st3, stp, ste, b, std} = require('../builders')
const STATS = require('../stats')
const COLOR = require('../color')
const COMMON = require('../common')
const _ = require('underscore')

class DailyRetention extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Daily Retention'
    this.subtitle = 'Daily retention, calculated using the latest DAU and cumulative installations (DNU)'
    this.path = 'dnu_dau_retention'
    this.menuTitle = 'Daily Retention'
    this.menuId = 'dailyRetention'
    this.reportContent = `<marquee>Daily Active Users Content</marquee>`
    this.contentTagId = 'DNUDAUContent'
    this.menuConfig.showWOISFilter = true
    this.menuConfig.showCountryCodeFilter = true
  }

  async retriever () {
    $('#DNUDAUContent').show()
    $('#DNUDAUFullContents').hide()
    $('#DNUDAUInstructions').show()
    setTimeout(() => {
      $('#DNUDAUInstructions').fadeOut()
    }, 10000)
    const results = await $.ajax('/api/1/daily_retention?' + $.param(this.app.pageState.standardParams()))
    await this.handler(results)
  }

  clampZeroToOneHundred (v) {
    if (v < 0) return 0
    if (v > 100) return 100
    return v
  }

  async handler (rows) {
    if (rows.length === 0) return
    $('#DNUDAUFullContents').fadeIn()

    const flattenedRows = _.flatten(rows)
    const campaignToRowsMap = _.object(_.map(rows, (campaign) => {
      return [campaign[0].campaign, campaign]
    }))
    const campaignNames = _.keys(campaignToRowsMap)

    // dau handler
    BaseReportComponent.buildMultiValueChartHandler('dauChartContainer', 'ymd', 'campaign', 'dau', 'Date', 'DAU', {
      colourBy: 'hashedLabel',
      yaxisLog: true
    })(flattenedRows)

    // dnu handler
    BaseReportComponent.buildMultiValueChartHandler('dnuChartContainer', 'ymd', 'campaign', 'dnu', 'Date', 'DNU', {
      colourBy: 'hashedLabel',
      yaxisLog: true
    })(flattenedRows)

    // dru handler
    BaseReportComponent.buildMultiValueChartHandler('druChartContainer', 'ymd', 'campaign', 'dru', 'Date', 'DRU', {
      colourBy: 'hashedLabel',
      yaxisLog: true
    })(flattenedRows)

    // retained handler
    BaseReportComponent.buildMultiValueChartHandler('retainedChartContainer', 'ymd', 'campaign', 'retained', 'Date', 'Retained %', {
      colourBy: 'hashedLabel',
      valueClamper: this.clampZeroToOneHundred,
      valueManipulator: (row) => {
        let modifiedRow = _.clone(row)
        modifiedRow.retained *= 100
        modifiedRow.retained = Math.round(modifiedRow.retained * 10000) / 10000
        return modifiedRow
      }
    })(flattenedRows)

    let countryDAU = []
    if (campaignNames.length === 1) {
      $('#daily-retention-dau-country').show()
      countryDAU = _.flatten(campaignToRowsMap[campaignNames[0]].map((r) => {
        return r.dauByCountry
      }))
      BaseReportComponent.buildMultiValueChartHandler('dauCountryChartContainer', 'ymd', 'country_code', 'count', 'Country', 'DAU', {
        colourBy: 'hashedLabel',
        yaxisLog: true,
        legend: false
      })(countryDAU)
    }  else {
      $('#daily-retention-dau-country').hide()
    }

    let tbl = $('#DNUDAUDataTable tbody')
    tbl.empty()

    // find the minimum and maximum dates in the series
    const sortedFlattenedRows = flattenedRows.sort((a, b) => {
      return a.ymd.localeCompare(b.ymd)
    })
    const minYMD = sortedFlattenedRows[0].ymd
    const maxYMD = sortedFlattenedRows[sortedFlattenedRows.length - 1].ymd

    let campaignHeaders = `<tr><td></td>`
    for (let campaign of rows) {
      let color = COLOR.colorForHashedLabel(campaign[0].campaign, 1)
      campaignHeaders += `<th class="text-center" style="color: ${color}" colspan=5>${campaign[0].campaign}</th>`
    }
    campaignHeaders += `</tr>`
    tbl.append(campaignHeaders)

    campaignHeaders = `<tr><td></td>`
    for (let campaign of rows) {
      campaignHeaders += th('DAU', 'right') +
        th('DNU', 'right') +
        th('DRU', 'right') +
        th('Installs', 'right') +
        th('Ret. %', 'right')
    }
    campaignHeaders += `</tr>`
    tbl.append(campaignHeaders)

    let controlYMD = maxYMD
    while (controlYMD >= minYMD) {
      let tableColumns = [ `<th nowrap>${controlYMD}</th>` ]
      for (let campaign of rows) {
        const foundRow = _.find(campaign, (r) => { return r.ymd === controlYMD })
        if (foundRow) {
          tableColumns.push(td(ste(foundRow.dau), 'right')),
          tableColumns.push(td(ste(foundRow.dnu), 'right')),
          tableColumns.push(td(ste(foundRow.dau - foundRow.dnu), 'right')),
          tableColumns.push(td(ste(foundRow.dnuSum), 'right')),
          tableColumns.push(td(stp(foundRow.retained), 'right'))
        }
      }
      tbl.append(tr(tableColumns))
      controlYMD = moment(controlYMD).subtract(1, 'day').format('YYYY-MM-DD')
    }

    let firstRecords = (lst, n = 7) => {
      if (lst.length < n) return lst
      return lst.slice(0, n)
    }

    const acronym = (text, l=3) => {
      const flds = text.split(/[ _\-]/g)
      if (flds.length > 0) {
        return flds.map((f) => { return f.substring(0, 1) }).join('').toUpperCase()
      } else {
        return text.substring(0, l).toUpperCase()
      }
    }

    const buildTableOfValues = (acronyms, summary, attribute, formatter) => {
      formatter = formatter || _.identity
      let buf = `<table class="table">`
      buf += `<tr>`
      for (let campaignName of _.keys(acronyms)) {
        let color = COLOR.colorForHashedLabel(campaignName, 1)
        buf += `<th class="text-right" style="color: ${color}">${acronyms[campaignName]}</th>`
      }
      buf += `</tr>`
      buf += `<tr>`
      for (let campaignName of _.keys(acronyms)) {
        buf += `<td class="text-right"><h4>${formatter(summary[campaignName].avg[attribute])}</h4></td>`
      }
      buf += `<td class="text-muted" style="vertical-align: middle;">last 7 days</td></tr>`
      buf += `</tr>`
      buf += `<tr>`
      for (let campaignName of _.keys(acronyms)) {
        buf += `<td class="text-right"><h4>${formatter(summary[campaignName].last[attribute])}</h4></td>`
      }
      buf += `<td class="text-muted text-left" style="vertical-align: middle;">most recent day</td></tr>`
      buf += `</table>`
      return buf
    }

    let acronyms = _.object(campaignNames.map((name) => { return [name, acronym(name)] }))
    let summary = _.object(campaignNames.map((campaignName) => { return [campaignName, {}] }))

    for (let campaignName of campaignNames) {
      let firstRows = firstRecords(campaignToRowsMap[campaignName].reverse())
      let firstRowValues = {
        dau: STATS.avg(_.pluck(firstRows, 'dau')),
        dru: STATS.avg(_.pluck(firstRows, 'dru')),
        dnuSum: STATS.avg(_.pluck(firstRows, 'dnuSum'))
      }
      firstRowValues.retained = firstRowValues.dau / firstRowValues.dnuSum
      summary[campaignName].avg = firstRowValues
      summary[campaignName].last = campaignToRowsMap[campaignName][0]
    }

    $('#DNUDAUDailyActives').html(buildTableOfValues(acronyms, summary, 'dau', ste))
    $('#DNUDAUDailyReturning').html(buildTableOfValues(acronyms, summary, 'dru', ste))
    $('#DNUDAUInstalls').html(buildTableOfValues(acronyms, summary, 'dnuSum', ste))
    $('#DNUDAURetention').html(buildTableOfValues(acronyms, summary, 'retained', stp))

    $('#summary-download').off('click')
    $('#summary-download').on('click', (evt) => {
      let data = JSON.parse(JSON.stringify(flattenedRows))
      data = data.sort((a, b) => {
        return a.campaign.localeCompare(b.campaign) ||
          b.ymd.localeCompare(a.ymd)
      })
      let buffer = 'CAMPAIGN,YMD,DAU,DNU,DRU,INSTALLS,RETENTION_PERCENTAGE\n'
      let q = (v) => { return `"${v}"` }
      for (let row of data) {
        buffer += [q(row.campaign), q(row.ymd), q(row.dau), q(row.dnu), q(row.dru), q(row.dnuSum), q(row.retained * 100)].join(',') + '\n'
      }
      COMMON.downloadObjectAs(buffer, 'daily-retention-summary.csv', 'text/csv')
    })

    $('#dau-country-download').off('click')
    $('#dau-country-download').on('click', (evt) => {
      let data = JSON.parse(JSON.stringify(countryDAU))
      data = data.sort((a, b) => {
        return b.ymd.localeCompare(a.ymd) || a.country_code.localeCompare(b.country_code)
      })
      let buffer = 'YMD,COUNTRY,DAU\n'
      let q = (v) => { return `"${v}"` }
      for (let row of data) {
        buffer += [q(row.ymd), q(row.country_code), q(row.count)].join(',') + '\n'
      }
      COMMON.downloadObjectAs(buffer, 'daily-retention-country-dau.csv', 'text/csv')
    })

    $(`#${this.contentTagId}`).show()
    $('#DNUDAUFullContents').show()
  }
}

module.exports = DailyRetention
