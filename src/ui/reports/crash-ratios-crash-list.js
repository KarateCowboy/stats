const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')
const { round } = require('../builders')
const agGrid = require('ag-grid-community')

class CrashRatiosCrashList extends BaseReportComponent {
  constructor () {
    super()
    this.title = 'Crash List for Build'
    this.subtitle = ''
    this.path = 'crash_ratio_list/:version/:platform?'
    this.menuTitle = ''
    this.menuId = 'crashRatioCrashList'
    this.reportContent = ``
    this.contentTagId = 'crashRatioContent'
    this.menuConfig.showWOISFilter = false
    this.menuConfig.showCountryCodeFilter = false
    this.menuConfig.showRefFilter = false
    this.menuConfig.showMuon = false
    this.menuConfig.showMobile = false
  }

  async retriever (req) {
    let results
    console.log(req.params)
    try {
      const urlString = '/api/1/crash_range_crashes?' + $.param(req.params)
      results = await $.ajax(urlString)
      await this.handler(results)
    } catch (e) {
      console.log(`Error running retriever for ${this.title}`)
      console.log(e)
      console.log(e.message)
    }
  }

  async handler (rows = []) {
    let table = $('#crash-ratio-table')
    table.empty()
    // specify the columns
    const columnDefs = [
      { headerName: 'ID',
        cellRenderer: (params) => { return `<a href="/dashboard#crash/${params.data.id}"> ${params.data.id }</a>` },
        sortable: true,
        filter: true
      },
      {
        headerName: 'Platform',
        valueGetter: (params) => { return params.data.contents.platform },
        sortable: true,
        filter: true
      },
      {
        headerName: 'Date',
        valueGetter: (params) => { return params.data.contents.year_month_day },
        sortable: true,
        filter: true
      }
    ]

    $('#agnosticGrid').show()
    // let the grid know which columns and what data to use
    const gridOptions = {
      columnDefs: columnDefs,
      rowData: rows
    }
    const eGridDiv = document.querySelector('#agnosticGrid')

    // create the grid passing in the div to use together with the columns & data we want to use
    this.grid = new agGrid.Grid(eGridDiv, gridOptions)
    console.log('created a new grid')
    $(`#${this.contentTagId}`).show()
    $('#crash-ratio-detail-table').hide()
  }
}

module.exports = CrashRatiosCrashList
