const $ = require('jquery')
const _ = require('lodash')

class BraveMenuAPI {
  constructor (jqueryEl, selectedIds = []) {
    this.el = jqueryEl
    this.selectedIds = selectedIds.reduce((acc, val) => {
      acc[val] = true
      return acc
    }, {})
    this.compiledBase = _.template(this.baseTemplate)
    this.el.append(this.compiledBase({
      title: this.title,
      placeholder: this.placeholder,
      showNone: this.showNone
    }))
    this.optionData = []
  }

  static init (pageState) {
    $('.braveMenuAPI').each(function () {
      window.menus = []
      const pageStateAttr = $(this).data('pageState')
      let menu = new BraveMenuAPI($(this), pageState[pageStateAttr])
      menu.init()
      menu.updateMenuUI()
    })
  }

  async init () {
    if (!this.url) return

    const searchHandler = _.debounce((evt) => {
      let term = $(evt.target).val()
      if (_.isEmpty(term)) {
        this.emptyChoices()
      } else {
        $.ajax({url: this.url + '?q=' + term}).then((d) => {
          this.emptyChoices()
          this.optionData = d
          const choiceList = this.el.find('ul')
          _.each(this.optionData, (item) => {
            choiceList.append(`<li class="choice"><a data-id="${item.id}" data-type="item"><i class="fa fa-check fa-blank"></i> <strong>${item.label}</strong></a></li>`)
            _.each(item.subitems, (subitem) => {
              choiceList.append(`<li class="choice"><a data-id="${subitem.id}" data-type="subitem"><i class="fa fa-check fa-blank"></i> <span>${subitem.label}</span> ` + (this.showId ? `<small class="text-muted">${subitem.id}</small>` : '') + `<span class="hidden">${item.label}</span></a></li>`)
            })
          })
          this.updateMenuUI()
        })
      }
    }, 250)

    this.el.on('keyup', 'input.search', searchHandler)

    // item was selected
    this.el.on('click', 'li.choice', (evt) => {
      const target = $(evt.target).closest('a')
      const type = target.data('type')
      const id = target.data('id')

      if (type === 'item') {
        this.subitemsByItem[id].forEach((subitem) => {
          this.selectedIds[subitem.id] = !this.selectedIds[subitem.id]
        })
      } else if (type === 'subitem') {
        this.selectedIds[id] = !this.selectedIds[id]
      }

      this.fireEvents()
      this.updateMenuUI()
    })

    // clear handler
    this.el.on('click', 'a.none', (evt) => {
      this.none()
    })
  }

  isChecked (i) {
    return i.find('i').hasClass('fa-blank') === false
  }

  selectedSubitems () {
    return _.keys(this.selectedIds).filter((id) => {
      return this.selectedIds[id] && !this.subitemsByItem[id]
    })
  }

  get domData () {
    return this.el ? this.el.data() : {}
  }

  get baseTemplate () {
    return `<a class="dropdown-toggle" type="button" data-toggle="dropdown"><span class="title"><%- title %></span> <span class="caret"></span></a>
     <ul class="dropdown-menu">
       <li><input class="form-control search" type="text" placeholder="<%- placeholder %>"></li>
     <% if (showNone) { %>
      <li display="hidden" style="display: none;" role="separator" class="divider" ></li>
      <li><a display="hidden" style="display: none;" class="none"><i class="fa fa-check fa-blank"></i> Clear</a></li>
      <li display="hidden" style="display: none;" role="separator" class="divider"></li>
     <% } %>
     </ul>`
  }

  updateMenuUI () {
    this.el.find('a').each((item, elem) => {
      let aEl = $(elem)
      const elemId = $(elem).data('id')
      if (this.selectedIds[elemId]) {
        if (aEl.find('i').hasClass('fa-blank')) {
          aEl.find('i').removeClass('fa-blank')
          aEl.show()
        }
      } else {
        if (!aEl.find('i').hasClass('fa-blank') && ['item', 'subitem'].includes(aEl.data('type'))) {
          aEl.find('i').addClass('fa-blank')
          if (_.isEmpty(this.el.find('input.search').val())) {
            aEl.hide()
          }
        }
      }
    })
    if (this.showSelectedCount) {
      if (this.selectedSubitems().length === 0) {
        this.el.find('a.dropdown-toggle span.title').text(`${this.title}`)
      } else if (this.selectedSubitems().length < 3) {
        this.el.find('a.dropdown-toggle span.title').text(`${this.title} (${this.selectedSubitems().join(', ')})`)
      } else {
        this.el.find('a.dropdown-toggle span.title').text(`${this.title} (${this.selectedSubitems().length})`)
      }
    }
    if (this.selectedSubitems().length > 0) {
      this.el.find('a.none').show()
      this.el.find('li[role=separator]').show()
    } else {
      this.el.find('a.none').hide()
      this.el.find('li[role=separator]').hide()
    }
  }

  get url () {
    return this.domData.api ? this.domData.api : null
  }

  get title () {
    return this.domData.title ? this.domData.title : 'Unknown'
  }

  get placeholder () {
    return this.domData.placeholder ? this.domData.placeholder : ''
  }

  get pageStateAttr () {
    return this.domData['pageState']
  }

  get showClear () {
    return this.domData.showNone !== undefined ? this.domData.showNone : false
  }

  get showNone () {
    return this.domData.showNone !== undefined ? this.domData.showNone : false
  }

  get showSelectedCount () {
    return this.domData.showSelectedCount ? this.domData.showSelectedCount : false
  }

  get showId () {
    return this.domData.showId ? this.domData.showId : true
  }

  get subitemsByItem () {
    return this.optionData.reduce((acc, val) => {
      acc[val.id] = val.subitems
      return acc
    }, {})
  }

  emptyChoices () {
    this.el.find('ul li.choice').remove() // empty the choices
  }

  fireEvents () {
    const selected = []
    for (let key in this.selectedIds) {
      if (this.selectedIds[key]) {
        selected.push(key)
      }
    }
    this.el.trigger('selection', [selected])
  }

  none () {
    this.selectedIds = {}
    this.emptyChoices()
    this.clearSearchTerm()
    this.updateMenuUI()
    this.fireEvents()
  }

  clearSearchTerm () {
    this.el.find('input.search').val('')
  }
}

module.exports = BraveMenuAPI
