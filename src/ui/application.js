const Grapnel = require('grapnel')
const BaseReportComponent = require('./base-report-component')
const MenuConfig = require('./menu-config')
const PageState = require('./page-state')
const $ = require('jquery')
const _ = require('lodash')
require('./stats')
require('./common')
// require('./publishers')

module.exports = class Application {
  constructor (reportComponents = [], pageState = null) {
    this.reports = {}
    this.pageState = new PageState()

    this.router = new Grapnel()
    this.menuState = new MenuConfig()
    this.contentTags = new Set()
    reportComponents.forEach((r) => {
      this.register(r)
    })
    this.currentlySelected = _.isEmpty(reportComponents) ? null : _.first(reportComponents).menuId
    if (pageState) {
      Object.assign(this.pageState, pageState)
    }
    this.drawSideBar()

    this.renderInitialUi()
    if (!_.isEmpty(this.reports) && this.currentlySelectedu) {
      this.router.navigate(this.reports[this.currentlySelected].path)
    }
    $(document).on('uiChange', () => {
      this.persistPageState()
      this.updateUiState()
    })
    $(document).on('dataChange', async () => {
      this.persistPageState()
      await this.reports[this.currentlySelected].retriever()
    })
  }

  currentReport () {
    if (!_.isEmpty(_.keys(this.reports)) && this.currentlySelected) {
      return this.reports[this.currentlySelected]
    } else {
      return undefined
    }
  }

  async updateUiState () {
    this.hideContentTags()
    $('#page-load-status').empty()
    $('#sideBar > li').removeClass('active')
    this.toggleMenuItems()
    if (this.currentReport()) {
      $('#contentTitle').empty().append(this.currentReport().title)
      $('#contentSubtitle').empty().append(this.currentReport().subtitle)
    }
    $(`#controls-days-menu > li > a > i `).addClass('fa-blank')
    $(`#days-${this.pageState.days} > i:nth-child(1)`).removeClass('fa-blank')
    if (this.pageState.days === 10000) {
      $('#controls-selected-days').html('All days')
    } else {
      $('#controls-selected-days').html(this.pageState.days + ' days')
    }
    // highlight currently selected platforms
    const controls = $('#controls')
    _.each(this.pageState.platformFilter, (v, k, lst) => {
      if (v) {
        controls.find(`a[data-platform="${k}"] i`).removeClass('fa-blank')
        controls.find(`h5.platform-list span.${k}`).show()
      } else {
        controls.find(`a[data-platform="${k}"] i`).addClass('fa-blank')
        controls.find(`h5.platform-list span.${k}`).hide()
      }
    })
    _.each(this.pageState.channelFilter, (v, k, lst) => {
      if (v) {
        controls.find(`a[data-channel="${k}"] i`).removeClass('fa-blank')
        controls.find(`h5.platform-list span.${k}`).show()
      } else {
        controls.find(`a[data-channel="${k}"] i`).addClass('fa-blank')
        controls.find(`h5.platform-list span.${k}`).hide()
      }
    })
    $('#' + this.currentlySelected).parent().addClass('active')
    $('#page-load-status').text('loaded')
    $(document).ajaxStart(function () {
      $('#hourglassIndicator').fadeIn(200)
    }).ajaxStop(function () {
      $('#hourglassIndicator').fadeOut(200)
    })
  }

  hideContentTags () {
    const toHide = Array.from(this.contentTags).filter((t) => { return t !== this.currentReport().contentTagId })
    toHide.forEach((t) => { $(`#${t}`).hide()})
  }

  toggleMenuItems () {
    _.each(this.menuState.mappings, (selector, attrib) => {
      if (this.menuState[attrib]) {
        $(selector).show()
      } else {
        $(selector).hide()
      }
    })
  }

  renderInitialUi () {
    $('#sideBar').empty().html(this.sideBar)
    this.setupSideFilter()
  }

  drawSideBar () {
    const _sideBar = `
    <li>
    <div class="input-group" style="padding: 8px;">
      <input type="text" class="form-control" id="searchLinks" placeholder="Filter...">
      <span class="input-group-btn">
        <button class="btn btn-default" type="button" id="clearSearchLinks"><i class="fa fa-times" aria-hidden="true"></i></button>
      </span>
    </div>
    </li>
      <% _.values(reportComponents).forEach(function(reportComponent) { %>
        <li><a href="#<%- reportComponent.path %>" id="<%- reportComponent.menuId %>"><%- reportComponent.menuTitle %></a></li>
      <% }) %>`
    const compiled = _.template(_sideBar)
    this.sideBar = compiled({
      reportComponents: this.reports
    })
  }

  setupSideFilter () {
    let filterLinksOn = function (text) {
      text = (text || '').toLowerCase()
      if (text) {
        $('.sidebar li a').each(function (idx, elem) {
          if (elem.text.toLowerCase().match(new RegExp(text))) {
            $(elem).closest('li').show(50)
          } else {
            $(elem).closest('li').hide(50)
          }
        })
      } else {
        $('.sidebar li a').each(function (idx, elem) {
          $(elem).closest('li').show('fast')
        })
      }
    }

    let menuFilters = [
      ['filterMAU', 'MAU'],
      ['filterDAU', 'DAU'],
      ['filterDNU', 'DNU'],
      ['filterLedger', 'Ledger'],
      ['filterCrashes', 'Crash'],
      ['filterPublisher', 'Publisher']
    ]

    menuFilters.forEach((pair) => {
      $('#' + pair[0]).on('click', function (evt) {
        evt.preventDefault()
        $('#searchLinks').val(pair[1])
        filterLinksOn(pair[1])
      })
    })

    let linksSearchInputHandler = function (e) {
      filterLinksOn(this.value)
    }

    const searchLinks = $('#searchLinks')
    searchLinks.on('input', _.debounce(linksSearchInputHandler, 50))

    $('#clearSearchLinks').on('click', function () {
      searchLinks.val('')
      filterLinksOn(null)
      searchLinks.focus()
    })

    searchLinks.focus()
  }

  register (reportComponent) {
    if (reportComponent.constructor.prototype instanceof BaseReportComponent === false && reportComponent instanceof BaseReportComponent === false) {
      throw new TypeError('`register` method requires an instance of BaseReportComponent')
    }
    reportComponent.app = this
    this.reports[reportComponent.menuId] = reportComponent
    this.router.get(reportComponent.path, async (req, evt) => { evt.preventDefault(); await this.routerOp(reportComponent)})
    this.contentTags.add(reportComponent.contentTagId)
  }

  async routerOp (reportComponent) {
    if (this.reports[this.currentlySelected]) {
      const contentTagId = this.reports[this.currentlySelected].contentTagId
      $(`#${contentTagId}`).hide()
    }

    this.currentlySelected = reportComponent.menuId
    Object.assign(this.menuState, reportComponent.menuConfig)
    await this.persistPageState()
    await reportComponent.retriever()
    await this.updateUiState()
  }

  get currentlySelected () {
    return this.pageState.currentlySelected
  }

  set currentlySelected (val) {
    this.pageState.currentlySelected = val
  }

  async persistPageState () {
    await window.localStorage.setItem('pageState', JSON.stringify(this.pageState))
  }
}
