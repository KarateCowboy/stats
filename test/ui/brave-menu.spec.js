const $ = require('jquery')
const BraveMenu = require('../../src/ui/brave-menu')
const expect = require('chai').expect
const woiResponse = require('../fixtures/woi-results')
const sinon = require('sinon')
const _ = require('lodash')
global.sandBox = null
describe('BraveMenu', async function () {
  before(async function () {
    sandBox = $('#sandBox')
    global.sandBoxHtml = sandBox.html() 
    console.log('running highest before block')
  })
  beforeEach(function () {
    console.log('running highest beforeeach')
    sandBox.empty()
    sandBox.html(global.sandBoxHtml)
  })
  describe('constructor', async function () {
    it('takes an identifying CSS id', async function () {
      const woiMenu = $('#woi_menu')
      const braveMenu = new BraveMenu(woiMenu)
      expect(braveMenu.el).to.equal(woiMenu)
    })
    it('takes the data-page-state value and sets it to the pageStateAttr', async function () {
      const woiMenu = $('#woi_menu')
      const braveMenu = new BraveMenu(woiMenu)
      expect(braveMenu).to.have.property('pageStateAttr', 'wois')
    })
    context('given selectedItems in the constructor', async function () {
      it('sets the selectedItems to the provided value if present', async function () {
        const woiMenu = $('#woi_menu')
        const selectedItems = ['2018-05-28', '2018-05-21', '2018-05-14']
        const braveMenu = new BraveMenu(woiMenu, selectedItems)
        expect(braveMenu.selectedItems).to.have.members(selectedItems)
      })
      it('sets the ui to match the selected items', async function () {
        const woiMenu = $('#woi_menu')
        const selectedItems = ['a', 'b', 'c']
        const braveMenu = new BraveMenu(woiMenu, selectedItems)
      })
    })
  })
  describe('config defaults', async function () {
    let braveMenu
    before(async function () {
      braveMenu = new BraveMenu($('#cc_menu'))
    })
    specify('title', async function () {
      expect(braveMenu).to.have.property('title', 'Unknown')
    })
    specify('placeholder', async function () {
      expect(braveMenu).to.have.property('placeholder', '')
    })
    specify('showSearch', async function () {
      expect(braveMenu).to.have.property('showSearch', false)
    })
    specify('showClear', async function () {
      expect(braveMenu).to.have.property('showClear', false)
    })
    specify('showSelectedCount', async function () {
      expect(braveMenu).to.have.property('showSelectedCount', false)
    })
    specify('showId', async function () {
      expect(braveMenu).to.have.property('showId', true)
    })
  })
  describe('buildMenu', async function () {
    it('builds the basic menu', async function () {
      const woiMenu = $('#woi_menu')
      const braveMenu = new BraveMenu(woiMenu)
      const woiData = woiMenu.data()
      //title and activate dropdown button
      const dropdownToggle = $('#woi_menu .dropdown-toggle')
      expect(dropdownToggle.is(':visible')).to.equal(true)
      expect(dropdownToggle.html()).to.contain(woiData.title)
      // dropdown menu
      const dropdownMenu = $('#woi_menu ul.dropdown-menu')
      expect(dropdownMenu.is(':visible')).to.equal(true)
      // placeholder
      const placeholder = $('#woi_menu .search')
      expect(placeholder.attr('placeholder')).to.equal(woiData.placeholder)
    })
  })
  describe('init', async function () {
    let braveMenu
    before(async function () {
      sinon.stub($, 'ajax').resolves(woiResponse)
      $('#woi_menu').empty()
      braveMenu = new BraveMenu($('#woi_menu'))
      await braveMenu.init()
    })
    after(async function () {
      $.ajax.restore()
    })
    it('fetches the remote data and stores it in optionData', async function () {
      expect(braveMenu).to.have.property('optionData')
      expect(braveMenu.optionData).to.equal(woiResponse)
    })
    it('makes an li for each option provided', async function () {
      const subItems = _.flatten(woiResponse.map(i => i.subitems))
      const createdLis = $('#woi_menu ul li.choice')
      expect(createdLis).to.have.property('length', subItems.length + woiResponse.length)
    })
  })
  describe('#updateMenuUI', async function () {
    it('puts fa-blank class on unselected items', async function () {
      sinon.stub($, 'ajax').resolves(woiResponse)
      const braveMenu = new BraveMenu($('#woi_menu'))
      let toSelect = woiResponse.slice(0, 2)
      toSelect = _.flatten(toSelect.map(i => i.subitems)).map(i => i.id)
      await braveMenu.init(toSelect)
      $.ajax.restore()
      const items = $('#woi_menu > ul > li > a > i')
      items.removeClass('fa-blank')
      expect(items).to.have.property('length', 83)
      const blankItems = $('#woi_menu > ul > li > a > i.fa-blank')
      expect(blankItems).to.have.property('length', 0)
      expect(_.every(items.each(function () { return $(this).hasClass('fa-blank') === false }))).to.equal(true)
      await braveMenu.updateMenuUI()

      // expect(_.every(items.each(function () { return $(this).hasClass('fa-blank') === false }))).to.equal(true)
    })
    context('when showSelectedCount is true', async function () {
      it('shows the selected count')
    })
  })
  describe('#selectedSubitems', async function () {
    it('returns an array', async function () {
      const braveMenu = new BraveMenu($('#woi_menu'))
      const results = braveMenu.selectedSubitems
      expect(results).to.be.an('array')
    })
    it('returns the sub items of selected items', async function () {
      const fetchedHtml = sandBox.html()
      sandBox.show()
      expect(fetchedHtml).to.equal(sandBoxHtml)
      const braveMenu = new BraveMenu($('#woi_menu'))
      sinon.stub($, 'ajax').resolves(woiResponse)
      const firstTwo = woiResponse.slice(0, 2)
      braveMenu.init(firstTwo.map(i => i.subitems).map(i => i.id))
      braveMenu.optionData = woiResponse
      const results = braveMenu.selectedSubitems()
      const expectedMembers = firstTwo.map(i => i.subitems).flat()
      console.log(`expectedMembers:`)
      console.log(expectedMembers)
      expect(results).to.have.members(expectedMembers)
      $.ajax.restore()
    })
  })
  describe('#isChecked', async function () {
    it('returns true or false when the item is selected or not', async function () {
      sinon.stub($, 'ajax').resolves(woiResponse)
      const braveMenu = new BraveMenu($('#woi_menu'))
      let toSelect = woiResponse.slice(0, 2)
      toSelect = _.flatten(toSelect.map(i => i.subitems)).map(i => i.id)
      await braveMenu.init(toSelect)
      $.ajax.restore()
      for (let i of toSelect) {
        const selectionString = `#woi_menu > ul > li > a[data-id=${i}] > i`
        $(selectionString).removeClass('fa-blank')
      }
      for (let i of toSelect) {
        const selectionString = `#woi_menu > ul > li > a[data-id=${i}] > i`
        const el = $(selectionString)
        const result = braveMenu.isChecked(el)
        expect(result).to.equal(true)
      }
    })

  })
  describe('subitemsByItem', async function () {
    specify('is a hash with array values', async function () {
      const selected = []
      const braveMenu = new BraveMenu($('#woi_menu'), selected)
      braveMenu.optionData = woiResponse
      let subItemsByItem = braveMenu.subitemsByItem
      let expectedSubitems = woiResponse.reduce((acc, val) => {
        acc[val.id] = val.subitems
        return acc
      }, {})
      expect(_.keys(subItemsByItem)).to.have.members(_.keys(expectedSubitems))
      for (let key in subItemsByItem) {
        expect(subItemsByItem[key]).to.have.members(expectedSubitems[key])
      }
    })
  })
})
