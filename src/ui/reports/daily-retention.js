const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const moment = require('moment')
const {round, td, ptd, th, tr, st, st1, st3, stp, b, std} = require('../builders')
const STATS = require('../stats')
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

    //dau handler
    BaseReportComponent.buildSingleValueChartHandler('dauChartContainer', 'ymd', 'dau', 'Date', 'DAU', {
      colorIdx: 0
    })(rows)

    //dnu handler
    BaseReportComponent.buildSingleValueChartHandler('dnuChartContainer', 'ymd', 'dnu', 'Date', 'DNU', {
      colorIdx: 1
    })(rows)

    //retained handler
    BaseReportComponent.buildSingleValueChartHandler('retainedChartContainer', 'ymd', 'retained', 'Date', 'Retained %', {
      colorIdx: 2,
      valueClamper: this.clampZeroToOneHundred,
      valueManipulator: (row) => {
        let modifiedRow = _.clone(row)
        modifiedRow.retained *= 100
        modifiedRow.retained = Math.round(modifiedRow.retained * 10000) / 10000
        return modifiedRow
      }
    })(rows)

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
      dau: STATS.avg(_.pluck(firstRows, 'dau')),
      installs: STATS.avg(_.pluck(firstRows, 'dnuSum'))
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
    $(`#${this.contentTagId}`).show()
    $('#DNUDAUFullContents').show()
  }
}

module.exports = DailyRetention
