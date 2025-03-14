function setup () {
  var filterLinksOn = function (text) {
    text = (text || '').toLowerCase()
    if (text) {
      $(".sidebar li a").each(function (idx, elem) {
        if (elem.text.toLowerCase().match(new RegExp(text))) {
          $(elem).closest('li').show(50)
        } else {
          $(elem).closest('li').hide(50)
        }
      })
    } else {
      $(".sidebar li a").each(function (idx, elem) {
        $(elem).closest('li').show('fast')
      })
    }
  }

  var menuFilters = [
    ['filterMAU', 'MAU'],
    ['filterDAU', 'DAU'],
    ['filterDNU', 'DNU'],
    ['filterLedger', 'Ledger'],
    ['filterCrashes', 'Crash'],
    ['filterPublisher', 'Publisher']
  ]

  menuFilters.forEach((pair) => {
    $("#" + pair[0]).on('click', function (evt) {
      evt.preventDefault()
      $("#searchLinks").val(pair[1])
      filterLinksOn(pair[1])
    })
  })

  var linksSearchInputHandler = function (e) {
    filterLinksOn(this.value)
  }

  $("#searchLinks").on('input', _.debounce(linksSearchInputHandler, 50))

  $("#clearSearchLinks").on('click', function () {
    $("#searchLinks").val('')
    filterLinksOn(null)
    console.log('inner focus')
    //$("#searchLinks").focus()
  })

  console.log('outer focus')
  //$("#searchLinks").focus()
}

window.SEARCH_LINKS = {
  setup
}
