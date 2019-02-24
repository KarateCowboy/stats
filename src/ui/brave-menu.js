(() => {
  const _ = require('underscore')
  const menus = $('.braveMenu')
  menus.each((menu, elem) => {
    const e = $(elem)

    const configDefaults = {
      title: 'Unknown',
      placeholder: '',
      showSearch: false,
      showClear: false,
      showSelectedCount: false,
      showId: true
    }
    const config = _.extend(configDefaults, e.data())

    const title = config.title
    const url = config.api
    e.append(`<a class="dropdown-toggle" type="button" data-toggle="dropdown"><span class="title">${title}</span> <span class="caret"></span></a>`)
    const items = $(`<ul class="dropdown-menu"></ul>`)
    e.append(items)

    const placeholder = config.placeholder
    if (config.showSearch) {
      items.append(`<li><input class="form-control search" type="text" placeholder="${placeholder}"></li>`)
    }
    if (config.showNone) {
      items.append(`<li role="separator" class="divider"></li>`)
      items.append(`<li><a class="none"><i class="fa fa-check fa-blank"></i> None</a></li>`)
      items.append(`<li role="separator" class="divider"></li>`)
    }

    let data
    let selectedIds = {}
    let subitemsByItem

    // update the menu check marks
    const updateMenuUI = () => {
      items.find('a').each((item, elem) => {
        const elemId = $(elem).data('id')
        if (selectedIds[elemId]) {
          if ($(elem).find('i').hasClass('fa-blank')) $(elem).find('i').removeClass('fa-blank')
        } else {
          if (!$(elem).find('i').hasClass('fa-blank')) $(elem).find('i').addClass('fa-blank')
        }
      })
      if (config.showSelectedCount) {
        e.find('a.dropdown-toggle span.title').text(`${title} (${selectedSubitems().length})`)
      }
      if (selectedSubitems().length > 0) {
        items.find('a.none').show()
        items.find('li[role=separator]').show()
      } else {
        items.find('a.none').hide()
        items.find('li[role=separator]').hide()
      }
    }

    // return selected list of subitems
    const selectedSubitems = () => {
      return _.keys(selectedIds).filter((id) => {
        return selectedIds[id] && !subitemsByItem[id]
      })
    }

    const isChecked = (elem) => {
      return !$(elem).find('i').hasClass('fa-blank')
    }

    const none = () => {
      selectedIds = {}
      clearSearchTerm()
      updateMenuUI()
      hideAllNotSelected()
      fireEvents()
    }

    // clear all selections
    items.on('click', 'a.none', (evt) => {
      none()
    })

    const hideAllNotSelected = () => {
      items.find('li.choice').find('a').each((item, elem) => {
        if (!isChecked(elem)) {
          $(elem).hide()
        }
      })
    }

    const showOrHideOnTerm = (term) => {
      terms = term.replace(/,/g, ' ').split(' ').map((t) => { return t.toLowerCase().trim() })
      items.find('li.choice').find('a').each((item, elem) => {
        const label = $(elem).text().trim().toLowerCase()
        if (terms.find((t) => {
          return label.match(t)
        })) {
          $(elem).show()
        } else {
          if (!isChecked(elem)) {
            $(elem).hide()
          }
        }
      })
    }

    const clearSearchTerm = () => {
      items.find('input.search').val('')
    }

    // show only items matching a search term
    items.on('keyup', 'input.search', (evt) => {
      let term = $(evt.target).val()
      if (term === '') {
        hideAllNotSelected()
      } else {
        showOrHideOnTerm(term)
      }
    })

    // this event will contain the complete list of currently selected country codes
    const fireEvents = () => {
      // fire custom event
      e.trigger('selection', [selectedSubitems()])
    }

    $.ajax({
      url: url
    }).done((d) => {
      data = d

      // build the menu
      _.each(data, (item) => {
        items.append(`<li class="choice"><a data-id="${item.id}" data-type="item"><i class="fa fa-check fa-blank"></i> <strong>${item.label}</strong></a></li>`)
        _.each(item.subitems, (subitem) => {
          items.append(`<li class="choice"><a data-id="${subitem.id}" data-type="subitem"><i class="fa fa-check fa-blank"></i> <span>${subitem.label}</span> ` + (config.showId ? `<small class="text-muted">${subitem.id}</small>` : '') + `<spann class="hidden">${item.label}</span></a></li>`)
        })
      })

      // index item to subitems
      subitemsByItem = _.object(data.map((item) => { return [item.id, item.subitems] }))

      // setup handlers
      items.on('click', 'li.choice', (evt) => {
        const target = $(evt.target).closest('a')
        const type = target.data('type')
        const id = target.data('id')
        if (type === 'item') {
          subitemsByItem[id].forEach((subitem) => {
            selectedIds[subitem.id] = !selectedIds[id]
          })
        }
        selectedIds[id] = !selectedIds[id]

        fireEvents()
        updateMenuUI()
      })

      none()
    })
  })
})()
