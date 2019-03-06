(() => {

let dauAverageRegion = (productRegionAverages, productCountryAverages, countries) => {
  // map a set of countries to a region id
  let regionCountryMap = {}
  for (let region of countries) {
    regionCountryMap[region.id] = region.subitems
  }

  const productLabels = {
    android: 'Android', core: 'Core', ios: 'iOS', muon: 'Muon'
  }

  const baseColor = net.brehaut.Color('#ff5500')
  const baseColorCountry = net.brehaut.Color('#0099ff')
  const baseColorTotal = net.brehaut.Color('#000000')

  // max average DAU for any region
  let max = _.max(productRegionAverages, (row) => { return row.avg_dau }).avg_dau

  // build a set of regions and products and map
  let regions = new Set()
  let products = new Set()
  let grouped = _.groupBy(productRegionAverages, (row) => {
    regions.add([row.id, row.ord])
    products.add(row.product)
    return `${row.product}:${row.id}`
  })

  // group the country rows by product
  let countryGrouped = _.groupBy(productCountryAverages, (row) => {
    return `${row.product}:${row.id}`
  })

  // calculate the product total average DAU
  let productTotals = {}
  for (let product of products) {
    productTotals[product] = _.reduce(_.filter(productRegionAverages, (row) => {
      return row.product === product
    }), (a, b) => { return a + b.avg_dau }, 0)
  }

  let table = $("#overview-dau-average-region .panel-body")
  let buf = `<table class="table">`

  // product headers
  buf += `<tr><td colspan="2"></td>`
  let productsTotal = 0
  for (let product of products) {
    productsTotal += productTotals[product]
  }
  for (let product of products) {
    buf += `<td nowrap class="text-right"><strong>${productLabels[product]}</strong><br/>${st1(Math.round(productTotals[product] / 1000 * 10) / 10)} <span class='subvalue'>${stp(productTotals[product] / productsTotal)}</span>`
    buf += `</td>`
  }
  buf += `<td class="text-right"><strong>All</strong><br/>${st1(Math.round(productsTotal / 1000 * 10) / 10)}</td>`
  buf += `</tr>`

  // sort the regions by 'ord' field
  const sortedRegions = _.uniq(Array.from(regions).sort((a, b) => {
    return a[1] - b[1]
  }).map((r) => { return r[0] }))

  // for each region
  for (let region of sortedRegions) {
    const regionId = region.toLowerCase().replace(/ /g, '-')

    // header
    buf += `<tr>`
    buf += `<td colspan="2"><a style="cursor: pointer;" class="region-title" data-region="${regionId}">${region}</a>`
    buf += `</td>`

    let regionProductTotal = 0
    // product totals
    for (let product of products) {
      let row = grouped[`${product}:${region}`][0]
      let per = row.avg_dau / max
      let cellColor = baseColor.desaturateByAmount(0.6 - per).lightenByAmount((1 - per) / 5.2)
      let avg_dauk = Math.round(parseFloat(row.avg_dau) / 1000 * 10) / 10
      let textColor = per > .35 ? "#eeeeee" : "#333333"
      buf += `<td style="background-color: ${cellColor}; color: ${textColor};" class="text-right" nowrap>${avg_dauk} <span class="subvalue">${stp(row.percentage)}</span></td>`
      regionProductTotal += row.avg_dau
    }
    per = regionProductTotal / productsTotal
    const regionCellColor = baseColorTotal.lightenByAmount(1 - Math.pow(per, 0.85))
    buf += `<td style="background-color: ${regionCellColor};" class="text-right" nowrap>${st1(Math.round(regionProductTotal / 1000 * 10) / 10)} <span class="subvalue">${stp(regionProductTotal / productsTotal)}</span></td>`
    buf += `</tr>`

    // foreach country in a region
    for (let country of regionCountryMap[region]) {
      buf += `<tr style="display: none;" class="region-countries" data-region="${regionId}">`
      buf += `<td> </td><td>${country.label} <span class="subvalue">${country.id}</span></td>`
      let countryProductTotal = 0
      for (let product of products) {
        const detailRow = countryGrouped[`${product}:${country.id}`] ?
          countryGrouped[`${product}:${country.id}`][0] :
          { avg_dau: 0 }
        let per = detailRow.avg_dau / max
        let cellColor = baseColorCountry.desaturateByAmount(0.65 - per).lightenByAmount((1 - per) / 5.7)
        buf += `<td style="background-color: ${cellColor}" class="text-right">${st1(Math.round(detailRow.avg_dau / 1000 * 10) / 10)} <span class="subvalue">${stp(detailRow.avg_dau / productTotals[product])}</td>`
        countryProductTotal += detailRow.avg_dau
      }
      per = countryProductTotal / productsTotal
      const countryCellColor = baseColorTotal.lightenByAmount(1 - Math.pow(per, 0.85))
      console.log(countryCellColor)
      buf += `<td style="background-color: ${countryCellColor}" class="text-right">${st1(Math.round(countryProductTotal / 1000 * 10) / 10)} <span class="subvalue">${stp(countryProductTotal / productsTotal)}</td>`
      buf += `</tr>`
    }
  }
  buf += `</table>`

  // click handlers
  table.off('click', '.region-title')
  table.on('click', '.region-title', (evt) => {
    const regionId = $(evt.target).data("region")
    $(`.region-countries[data-region=${regionId}]`).toggle('fast')
  })

  $("#average-dau-download").off('click')
  $("#average-dau-download").on('click', (evt) => {
    let buffer = 'PRODUCT,COUNTRY,CODE,REGION,AVERAGE_DAU,PERCENTAGE\n'
    let q = (v) => { return `"${v}"` }
    for (let row of productCountryAverages) {
      buffer += [q(row.product), q(row.label), q(row.id), q(row.region_id), q(row.avg_dau), q(row.percentage * 100)].join(',') + "\n"
    }
    window.STATS.COMMON.downloadObjectAs(buffer, 'average-dau-by-country.csv', 'text/csv')
  })

  table.html(buf)
}

const firstRun = (rows, b) => {
  var groups = _.groupBy(rows, function (row) { return row.mobile })
  var desktop = groups[false].sort(function(a, b) { return b.count - a.count })
  var mobile = groups[true].sort(function(a, b) { return b.count - a.count })

  var sumOfAll = _.reduce(rows, function (memo, row) { return memo + row.count }, 0)
  var sumOfDesktop = _.reduce(desktop, function (memo, row) { return memo + row.count }, 0)
  var table = $("#overview-first-run-table-desktop tbody")
  table.empty()
  _.each(desktop, function (row) {
    var buf = '<tr>'
    buf = buf + b.td(`<img src="/local/img/platform-icons/${row.platform}.png" height="18">`)
    buf = buf + b.td(row.platform, 'left')
    buf = buf + b.td(b.st(row.count), 'right')
    buf = buf + b.td(numeral(row.count / sumOfDesktop).format('0.0%'), 'right')
    buf = buf + b.td(numeral(row.count / sumOfAll).format('0.0%'), 'right')
    buf = buf + "</tr>"
    table.append(buf)
  })
  table.append(b.tr([b.td(), b.td(), b.td(b.b(b.st(sumOfDesktop)), 'right'), b.td(b.b(numeral(sumOfDesktop / sumOfAll).format('0.0%')), 'right'), b.td()]))

  var sumOfMobile = _.reduce(mobile, function (memo, row) { return memo + row.count }, 0)
  table = $("#overview-first-run-table-mobile tbody")
  table.empty()
  _.each(mobile, function (row) {
    if (row.platform === 'Android Browser') row.platform = 'android'
    var buf = '<tr>'
    buf = buf + b.td(`<img src="/local/img/platform-icons/${row.platform}.png" height="18">`)
    buf = buf + b.td(row.platform, 'left')
    buf = buf + b.td(st(row.count), 'right')
    buf = buf + b.td(numeral(row.count / sumOfMobile).format('0.0%'), 'right')
    buf = buf + b.td(numeral(row.count / sumOfAll).format('0.0%'), 'right')
    buf = buf + "</tr>"
    table.append(buf)
  })
  table.append(b.tr([b.td(), b.td(), b.td(b.b(b.st(sumOfMobile)), 'right'), b.td(b.b(numeral(sumOfMobile / sumOfAll).format('0.0%')), 'right'), b.td()]))
  table.append(b.tr([b.td(), b.td(), b.td(b.b(b.st(sumOfAll)), 'right'), b.td(), b.td()]))
}


var ledger = function (btc, bat, b) {
  var overviewTable = $("#overview-ledger-table tbody")
  overviewTable.empty()

  overviewTable.append(tr([
    b.td(""),
    b.th('<img src="/local/img/token-icons/btc.png" height="18"> BTC', "right"),
    b.th('<img src="/local/img/token-icons/bat.svg" height="18"> BAT', "right"),
    b.td()
  ]))
  overviewTable.append(tr([
    b.td("Wallets"),
    b.td(b.st(btc.wallets), "right"),
    b.td(b.st(bat.wallets), "right"),
    b.td()
  ]))
  overviewTable.append(tr([
    b.td("Funded wallets"),
    b.td(b.st(btc.funded), "right"),
    b.td(b.st(bat.funded), "right"),
    b.td()
  ]))
  overviewTable.append(tr([
    b.td("Percentage of wallets funded"),
    b.td(numeral(btc.funded / btc.wallets).format('0.0%'), "right"),
    b.td(numeral(bat.funded / bat.wallets).format('0.0%'), "right"),
    b.td()
  ]))
  overviewTable.append(tr([
    b.td("USD / 1 Token"),
    b.td(b.st3(btc.btc_usd), "right"),
    b.td(b.st3(bat.bat_usd), "right"),
    b.td('$ USD')
  ]))
  overviewTable.append(tr([
    b.td("Total balance of funded wallets"),
    b.td(b.st3(btc.balance ), "right"),
    b.td(b.st3(bat.balance), "right"),
    b.td('tokens')
  ]))
  overviewTable.append(tr([
    b.td(),
    b.td(b.std(btc.balance * btc.btc_usd), "right"),
    b.td(b.std(bat.balance * bat.bat_usd), "right"),
    b.td('$ USD')
  ]))
  overviewTable.append(tr([
    b.td("Average balance of funded wallets"),
    b.td(b.round((btc.balance / btc.funded) , 6), "right"),
    b.td(b.round((bat.balance / bat.funded), 6), "right"),
    b.td('tokens')
  ]))
  overviewTable.append(tr([
    b.td(),
    b.td(b.std((btc.balance / btc.funded)  * btc.btc_usd), "right"),
    b.td(b.std((bat.balance / bat.funded) * bat.bat_usd), "right"),
    b.td('$ USD')
  ]))
}

var monthAveragesHandler = function (rows, b) {
  var tblHead = $("#monthly-averages-table thead")
  var tblBody = $("#monthly-averages-table tbody")

  var months = _.uniq(_.pluck(rows, 'ymd')).map(function (ymd) { return ymd.substring(0, 7) }).sort()
  var buf = "<tr><th></th>" + months.map(function (ymd) { return th(ymd, 'right') }).join('') + "</tr>"
  tblHead.html(buf)

  var platforms = _.uniq(_.pluck(rows, 'platform')).sort()
  var platformStats = _.groupBy(rows, function (row) { return row.platform } )
  var platformCrossTab = _.groupBy(rows, function (row) { return row.ymd.substring(0, 7) + '|' + row.platform })

  var formatPlatformMonth = function (platformMonth, last) {
    var b = ''
    var diffs

    var fdiff = function (diffs, k) {
      var cls
      if (diffs) {
        cls = 'ltz'
        if (diffs[k + '_per'] > 0) cls = 'gtz'
        return ' <span class="' + cls + '">' + stp(diffs[k + '_per']) + '</span>'
      } else {
        return ''
      }
    }

    if (last) {
      diffs = {
        mau_per: window.STATS.COMMON.safeDivide(platformMonth.mau - last.mau, platformMonth.mau),
        dau_per: window.STATS.COMMON.safeDivide(platformMonth.dau - last.dau, platformMonth.dau),
        first_time_per: window.STATS.COMMON.safeDivide(platformMonth.first_time - last.first_time, platformMonth.first_time)
      }
    }
    b = b + '<div>' + st(platformMonth.mau) + fdiff(diffs, 'mau') + '</div>'
    b = b + '<div>' + st(platformMonth.dau) + fdiff(diffs, 'dau') + '</div>'
    b = b + '<div>' + st(platformMonth.first_time) + fdiff(diffs, 'first_time') + '</div>'
    b = b + '<div>' + std(window.STATS.COMMON.safeDivide(platformMonth.dau, platformMonth.mau)) + '</div>'
    b = b + '<div>' + st1(window.STATS.COMMON.safeDivide(platformMonth.mau, platformMonth.first_time)) + '</div>'
    return b
  }

  var buf = ''
  platforms.forEach(function (platformName) {
    var platformData = platformStats[platformName]
    buf = buf + '<tr>'
    buf = buf + td(b.b(platformName))
    var last = null
    months.forEach(function (month) {
      var monthPlatformInfo = platformCrossTab[month + '|' + platformName]
      if (monthPlatformInfo) {
        monthPlatformInfo = monthPlatformInfo[0]
        buf = buf + td(formatPlatformMonth(monthPlatformInfo, last), 'right')
        last = monthPlatformInfo
      } else {
        buf = buf + td('')
      }
    })
    buf = buf + '</tr>'
  })
  tblBody.html(buf)
}

window.OVERVIEW = {
  ledger,
  firstRun,
  monthAveragesHandler,
  dauAverageRegion
}

})()
