const _ = require('lodash')
const {expect} = require('chai')
const Application = require('../../src/ui/application')
const BaseReportComponent = require('../../src/ui/base-report-component')
const MenuConfig = require('../../src/ui/menu-config')
const PageState = require('../../src/ui/page-state')
const sinon = require('sinon')
const Grapnel = require('grapnel')

describe('Application', function () {
  let application
  beforeEach(function () {
    sinon.stub(Grapnel.prototype, 'navigate').returns('foo')
    application = new Application()
  })
  afterEach(function () {
    Grapnel.prototype.navigate.restore()
  })
  specify('has a Grapnel router instance', function () {
    expect(application.router).to.be.instanceOf(Grapnel)
  })
  specify('refreshData')
  specify('sideBar', function () {
    expect(application).to.have.property('sideBar')
  })
  specify('currentlySelected', function () {
    expect(application).to.have.property('currentlySelected')
  })
  specify('menuState', function () {
    expect(application.menuState).to.be.instanceOf(MenuConfig)
  })
  specify('pageState', function () {
    expect(application.pageState instanceof PageState).to.equal(true)
  })
  specify('contentTags', function () {
    expect(application.contentTags).to.be.an('set')
  })
  describe('register', function () {
    let sampleComponent
    beforeEach(function () {
      sampleComponent = new BaseReportComponent()
      sampleComponent.handler = () => { return `<marquee>Hello World</marquee>`}
      sampleComponent.retriever = async function () { return this.handler() }
      sampleComponent.path = 'testpath'
      sampleComponent.menuId = 'mnSample'
      _.assign(sampleComponent.menuConfig, {showWOISFilter: false, showRefFilter: false})
    })
    it('accepts only BaseReportComponents', function () {
      let thrown = false
      try {
        const invalidReport = {}
        application.register(invalidReport)
      } catch (e) {
        expect(e).to.have.property('message', '`register` method requires an instance of BaseReportComponent')
        thrown = true
      }
      expect(thrown).to.equal(true, 'error should have been thrown')

      class CustomReport extends BaseReportComponent {}

      const validReport = new CustomReport()
      application.register(validReport)
    })
    it('adds the report to the list of pages', function () {
      application.register(sampleComponent)
      expect(application.reports).to.have.property(sampleComponent.menuId, sampleComponent)
    })
    it('assigns the app to the report', async function () {
      application.register(sampleComponent)
      expect(sampleComponent.app).to.equal(application)
    })
    it('adds the report\'s path to the router', function () {
      const stubbed = sinon.stub(application.router, 'get')
      let usesPath = false
      stubbed.withArgs(sampleComponent.path, sinon.match.any).callsFake((arg1, arg2) => {
        if (arg1 === sampleComponent.path) {
          usesPath = true
        }
      })
      application.register(sampleComponent)
      expect(application.router.get.called).to.equal(true)
      expect(usesPath).to.equal(true)
      application.router.get.restore()
    })
    it('adds the reports contentTagId to the application list of content tags', async function () {
      application.register(sampleComponent)
      expect(application.contentTags).to.include(sampleComponent.contentTagId)
    })
    describe('.routerOp', function () {
      it('sets #currentlySelected to the report\'s menuId', function () {
        application.routerOp(sampleComponent)
        expect(application.currentlySelected).to.equal(sampleComponent.menuId)
      })
      it('updates the menu state', async function () {
        application.routerOp(sampleComponent)
        expect(_.keys(application.menuState)).to.have.members(_.keys(sampleComponent.menuConfig))
      })
      it('invokes the report\'s retriever', async function () {
        sampleComponent.retriever = sinon.stub().resolves('baz')
        await application.routerOp(sampleComponent)
        expect(sampleComponent.retriever.called).to.equal(true, 'report retriever should by executed')
      })
      it('invokes updateUiState', async function () {
        application.updateUiState = sinon.stub().resolves('baz')
        await application.routerOp(sampleComponent)
        expect(application.updateUiState.called).to.equal(true)
      })
      it('saves the state', async function () {
        const savedPageState = new PageState()
        savedPageState.platformFilter.osx = false
        await window.localStorage.setItem('pageState', JSON.stringify(savedPageState))
        await application.routerOp(sampleComponent)
        const loadedPageState = JSON.parse(await window.localStorage.getItem('pageState'))
        expect(savedPageState.platformFilter.osx).to.equal(!loadedPageState.platformFilter.osx)
      })

      specify('hides the prior selected content', async function () {
        const $ = require('jquery')
        application.reports = []
        sampleComponent.contentTagId = 'sampleContent'
        application.register(sampleComponent)
        const secondComponent = _.clone(sampleComponent)
        secondComponent.contentTagId = 'secondContent'
        secondComponent.menuId = 'secondMenu'
        application.register(secondComponent)
        await application.routerOp(sampleComponent)
        $('#sampleContent').show()
        expect($(`#${sampleComponent.contentTagId}`).is(':hidden')).to.equal(false)
        await application.routerOp(secondComponent)
        expect($(`#${sampleComponent.contentTagId}`).is(':hidden')).to.equal(true)
      })
    })
    describe('updateUiState', async function () {
      specify('calls the hideContentTags method', async function () {
        application.reports = []
        application.register(sampleComponent)
        sinon.stub(application, 'hideContentTags')
        await application.updateUiState()
        expect(application.hideContentTags.called).to.equal(true)
        application.hideContentTags.restore()
      })
      specify('show / hide controls based on report menuConfig', async function () {
        const $ = require('jquery')
        application.reports = []
        application.register(sampleComponent)
        application.currentlySelected = sampleComponent.menuId
        sinon.stub(application, 'toggleMenuItems')
        await application.updateUiState()
        expect(application.toggleMenuItems.called).to.equal(true)
        application.toggleMenuItems.restore()
      })
      it('set the title and subtitle to the report title and subtitle', async function () {
        const $ = require('jquery')
        application.reports = []
        sampleComponent.title = 'Temporary Test Title'
        sampleComponent.subtitle = 'Temporary Test Subtitle'
        application.register(sampleComponent)
        application.currentlySelected = sampleComponent.menuId
        application.updateUiState()

        const contentTitle = $('#contentTitle')
        expect(contentTitle.text()).to.equal(sampleComponent.title)

        const contentSubtitle = $('#contentSubtitle')
        expect(contentSubtitle.text()).to.equal(sampleComponent.subtitle)

      })
      specify('highlight currently selected days', async function () {
        const $ = require('jquery')
        application.reports = []
        application.register(sampleComponent)
        application.currentlySelected = sampleComponent.menuId
        application.pageState.days = _.shuffle(application.pageState.dayOptions)[0]
        console.log(`pageState.days is ${application.pageState.days}`)
        await application.updateUiState()

        application.pageState.dayOptions.forEach((d) => {
          const currentDayOption = $(`a[data-days="${d}"] i`)
          if (d === application.pageState.days) {
            expect(currentDayOption.hasClass('fa-blank')).to.equal(false)
          } else {
            expect(currentDayOption.hasClass('fa-blank')).to.equal(true)
          }
        })
      })
      specify('highlight currently selected platforms', async function () {
        const $ = require('jquery')
        application.reports = []
        application.register(sampleComponent)
        application.currentlySelected = sampleComponent.menuId
        for (let key in application.pageState.platformFilter) {
          application.pageState.platformFilter[key] = _.shuffle([true, false])[0]
        }
        await application.updateUiState()
        const controls = $('#controls')
        console.log(`.`)
        console.log(`.`)
        console.log(`.`)
        _.each(application.pageState.platformFilter, (v, k, lst) => {
          console.log(`.`)
          console.log(`.`)
          console.log(`.`)
          if (v) {
            const hasClass = controls.find(`a[data-platform="${k}"] i`).hasClass('fa-blank')
            expect(hasClass).to.equal(false, `platform value ${k} should not have the fa-blank class`)
          } else {
            const hasClass = controls.find(`a[data-platform="${k}"] i`).hasClass('fa-blank')
            expect(hasClass).to.equal(true, `platform value ${k} should not have the fa-blank class`)
          }
        })

      })
      specify('update menu label for days', async function () {
        const $ = require('jquery')
        application.reports = []
        application.register(sampleComponent)
        application.currentlySelected = sampleComponent.menuId
        application.pageState.days = _.shuffle(application.pageState.dayOptions)[0]
        await application.updateUiState()
        const menuLabelContent = $('#controls-selected-days').html()
        if (application.pageState.days === 10000) {
          expect(menuLabelContent).to.equal(`All days`)
        } else {
          expect(menuLabelContent).to.equal(`${application.pageState.days} days`)
        }
      })
      describe('#drawSideBar', async function () {
        it('has no li/a when there are no reports registered', async function () {
          application.reports = []
          expect(application.reports).to.have.property('length', 0)
          application.drawSideBar()
          expect(application.sideBar).to.not.contain('<li>')
        })
        it('displays one li/a per report', async function () {
          application.register(sampleComponent)
          application.drawSideBar()
          const matches = application.sideBar.match(/<li>/g)
          expect(matches).to.have.property('length', _.keys(application.reports).length + 1)
        })
        it('does not display a link or menu item for configs with falsy menuTitle or menuId', async function () {
          sampleComponent.menuTitle = ''
          application.register(sampleComponent)

          application.drawSideBar()
          let matches = application.sideBar.match(/<li>/g)
          expect(matches).to.have.property('length', _.keys(application.reports).length)

          sampleComponent.menuTitle = 'Sample Title'
          sampleComponent.menuId = ''

          application.drawSideBar()
          matches = application.sideBar.match(/<li>/g)
          expect(matches).to.have.property('length', _.keys(application.reports).length)
        })
      })
    })
    describe('toggleMenuItems', async function () {
      context('respective menuConfig keys => DOM objects', async function () {
        specify('show / hide #ref-filter based on MenuConfig.showRefFilter', async function () {
          const $ = require('jquery')
          application.reports = []
          application.register(sampleComponent)
          application.currentlySelected = sampleComponent.menuId
          application.menuState.showRefFilter = false
          // sinon.stub(application, 'toggleMenuItems')
          // await application.updateUiState()
          // expect(application.toggleMenuItems.called).to.equal(true)
          // application.toggleMenuItems.restore()
          application.toggleMenuItems()
          const refFilter = $('#ref-filter')
          expect(refFilter.parent().is(':hidden')).to.equal(true, 'refFilter should be hidden')
        })

        beforeEach(async function () {
          application.reports = []
          application.register(sampleComponent)
          sampleComponent.menuConfig = new MenuConfig()
        })
        specify('shows and hides specified controls', async function () {
          const $ = require('jquery')
          const sampleMenuConfig = new MenuConfig()
          delete sampleMenuConfig.mappings['showPagination']
          for (let key in sampleMenuConfig.mappings) {
            application.menuState[key] = false
            await application.toggleMenuItems()
            const domObject = $(sampleMenuConfig.mappings[key])
            expect(domObject.is(':hidden')).to.equal(true, `${key} element should be hidden`)
            application.menuState[key] = true
            await application.toggleMenuItems()
            expect(domObject.is(':visible')).to.equal(true, `${key} controls element should be visible`)
          }
        })
      })
    })
  })
  describe('init', async function () {
    it('takes an ordered array report objects and registers each of them', async function () {
      const dailyNewUsers = new BaseReportComponent()
      dailyNewUsers.menuId = 'dailyNewUsers'
      const sampleReports = [
        dailyNewUsers
      ]
      const app = new Application(sampleReports)
      expect(app.reports).to.have.property('dailyNewUsers', dailyNewUsers)
    })
    it('builds and the basic sidebar view', async function () {
      const dailyNewUsers = new BaseReportComponent()
      dailyNewUsers.menuId = 'dailyNewUsers'
      const dailyReturningUsers = new BaseReportComponent()
      dailyReturningUsers.menuId = 'dailyReturningUsers'
      const sampleReports = [
        dailyNewUsers,
        dailyReturningUsers
      ]
      const app = new Application(sampleReports)
      expect(app.sideBar.match(/<li>/g)).to.have.property('length', 3)
    })
    it('calls renderInitialUi', async function () {
      sinon.spy(Application.prototype, 'renderInitialUi')
      const app = new Application()
      expect(app.renderInitialUi.called).to.equal(true)
      Application.prototype.renderInitialUi.restore()
    })
  })
  describe('renderInitialUi', async function () {
    it('displays the sideBar', async function () {
      const $ = require('jquery')
      const sampleReport = new BaseReportComponent()
      const app = new Application([sampleReport])
      const sideBar = $('#sideBar')
      const html = sideBar.html()
      expect(html).to.equal(app.sideBar)
    })
  })
})
