const $ = require('jquery')
const uiChange = require('./ui-change-event')
const dataChange = require('./data-change-event')

module.exports = class PageState {
  constructor () {
    this.currentlySelected = null
    this.days = 14
    this.version = null
    this.dayOptions = [10000, 365, 120, 90, 60, 30, 14, 7]
    this.ref = []
    this.offset = 0
    this.showToday = false
    this.platformFilter = {
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
    }
    this.productPlatforms = {
      muon: ['winx64', 'winia32', 'osx', 'linux'],
      core: ['winx64-bc', 'winia32-bc', 'osx-bc', 'linux-bc'],
      mobile: ['androidbrowser', 'ios', 'android']
    }
    this.channelFilter = {
      'dev': true,
      'beta': false,
      'nightly': false,
      'release': true
    }
    this.wois = []
    this.countryCodes = []
    this.metricIds = []

    // dispatch pagination events
    $('#controls-pagination').on('click', 'a', (e) => {
      console.log('pagination click')
      if ($(e.target).hasClass('pagination-first')) { this.offset = 0 }
      if ($(e.target).hasClass('pagination-previous')) { this.offset -= 100 }
      if ($(e.target).hasClass('pagination-next')) { this.offset += 100 }
      if (this.offset < 0) this.offset = 0
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })

    $('#controls-days-menu').on('click', 'a', (evt) => {
      const target = $(evt.target)
      const days = parseInt(target.data('days'))
      if (days !== 0) {
        this.days = days
      } else {
        this.showToday = !this.showToday
      }
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })

    // callback from brave-menu
    $('#woi_menu').on('selection', (evt, wois) => {
      this.wois = wois
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })

    // callback from brave-menu
    $('#cc_menu').on('selection', (evt, countryCodes) => {
      this.countryCodes = countryCodes
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })

    // callback from brave-menu-api
    $('#ref_menu').on('selection', (evt, ref) => {
      this.ref = ref
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })

    // callback from brave-menu-api
    $('#metric_menu').on('selection', (evt, metricIds) => {
      this.metricIds = metricIds
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })

    $('#controls-muon-menu').on('click', 'a', (e) => { this.productMenuHandler(e)})
    $('#controls-core-menu').on('click', 'a', (e) => { this.productMenuHandler(e)})
    $('#controls-mobile-menu').on('click', 'a', (e) => { this.productMenuHandler(e)})

    $('#controls-channels-menu').on('click', 'a', (evt) => {
      const target = $(evt.target)
      const channel = target.data('channel')
      this.channelFilter[channel] = !this.channelFilter[channel]
      document.dispatchEvent(uiChange)
      document.dispatchEvent(dataChange)
    })
  }

  productMenuHandler (evt) {
    const target = $(evt.target)
    let platform = target.data('platform')
    if (platform.split(':').length === 1) {
      this.platformFilter[platform] = !this.platformFilter[platform]
    } else {
      let [product, action] = platform.split(':')
      if (action === 'all') {
        for (let plat of this.productPlatforms[product]) {
          this.platformFilter[plat] = true
        }
      }
      if (action === 'none') {
        for (let plat of this.productPlatforms[product]) {
          this.platformFilter[plat] = false
        }
      }
      if (action === 'only') {
        for (let prod of ['muon', 'core', 'mobile']) {
          if (prod === product) {
            for (let plat of this.productPlatforms[prod]) {
              this.platformFilter[plat] = true
            }
          } else {
            for (let plat of this.productPlatforms[prod]) {
              this.platformFilter[plat] = false
            }
          }
        }
      }
    }
    document.dispatchEvent(uiChange)
    document.dispatchEvent(dataChange)
  }

  standardParams () {
    return {
      days: this.days,
      platformFilter: this.serializePlatformParams(),
      channelFilter: this.serializeChannelParams(),
      showToday: this.showToday,
      version: null,
      ref: (this.ref || []).join(','),
      wois: this.wois.join(','),
      countryCodes: this.countryCodes.join(','),
      metricIds: this.metricIds.join(','),
      offset: this.offset
    }
  }

  serializePlatformParams () {
    let filterPlatforms = _.filter(_.keys(this.platformFilter), (id) => {
      return this.platformFilter[id]
    })
    return filterPlatforms.join(',')
  }

  serializeChannelParams () {
    let filterChannels = _.filter(_.keys(this.channelFilter), (id) => {
      return this.channelFilter[id]
    })
    if (this.channelFilter.release) filterChannels.push('stable')
    return filterChannels.join(',')
  }
}
