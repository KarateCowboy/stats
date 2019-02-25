(function () {
  const valueFormatter = (v) => {
    if (v > 999) {
      return numeral(Math.round(v / 100) / 10).format('0,0.0') + 'k'
    } else {
      return numeral(v).format('0,0')
    }
  }

  const sparklineOptions = {
    width: '60px',
    height: '25px',
    disableInteraction: true,
    fillColor: '#efefef',
    lineColor: '#999999',
    chartRangeMin: 0,
    chartRangeMax: 100,
  }

  const weeklyRetentionHandler = async function (rows) {
    console.log('weeklyRetentionHandler')
    let i, row, cellColor, weekDelta
    let rowHeadings = []
    let buffer = ''

    console.log(rows)

    const baseColor = net.brehaut.Color('#ff5500')
    const baseColorAvg = net.brehaut.Color('#999999')

    // headings
    buffer += `<table class='table'>`
    buffer += `<tr class='active'><th colspan='2'>Weeks since installation</th>`
    for (i = 0; i < 12; i++) {
      buffer += `<th class='retentionCell'>${i + 1}</th>`
    }
    buffer += `</tr>`

    // heading sparklines
    buffer += `<tr><td></td>`
    for (i = 0; i < 12; i++) {
      buffer += `<td><span id="sparklineDelta${i}"></span></td>`
    }
    buffer += `<td></td></tr>`

    // averages
    buffer += '<tr><th>Average</th><td></td>'
    for (i = 1; i < 12; i++) {
      avg = STATS.STATS.avg(rows.filter((row) => { return row.week_delta === i }).map((row) => { return row.retained_percentage })) || 0
      cellColor = baseColorAvg.desaturateByAmount(1 - avg).lightenByAmount((1 - avg) / 2.2)
      buffer += `<td style="background-color: ${cellColor}" class="retentionCell">${st(avg * 100)}</td>`
    }
    buffer += `<td style="background-color: ${cellColor}" class="retentionCell"></td>`
    buffer += `</tr>`

    // cell contents
    buffer += '<tr>'
    let ctrl = null
    for (i = 0; i < rows.length; i++) {
      row = rows[i]
      if (row.woi !== ctrl) {
        buffer += '</tr><tr>'
        buffer += `<td><span id='sparklineActual${row.woi}'></span><br>`
        buffer += `<th nowrap>${moment(row.woi).format('MMM D')}<br><small class="text-muted">${valueFormatter(row.starting)}</small></th>`
        rowHeadings.push(row.woi)
        ctrl = row.woi
        weekDelta = 0
      }
      weekDelta += 1
      cellColor = baseColor.desaturateByAmount(0.75 - row.retained_percentage).lightenByAmount((1 - row.retained_percentage) / 6.2)
      buffer += `
        <td style="background-color: ${cellColor}" class="retentionCell">
          ${st(row.retained_percentage * 100)}<br>
          <small class="text-muted">${valueFormatter(row.current)}</small>
        </td>`
    }
    buffer += '<td><span id=\'sparklineDelta' + weekDelta + '\'></span><br>'
    buffer += '</tr>'
    buffer += '</table>'

    // insert elements
    const div = $('#weeklyRetentionTableContainer')
    div.empty()
    div.append(buffer)

    // heading sparklines
    for (i = 0; i < 12; i++) {
      sparkData = rows.filter((row) => { return row.week_delta === i }).map((row) => { return parseInt(row.retained_percentage * 100) })
      $('#sparklineDelta' + i).sparkline(sparkData, sparklineOptions)
    }

    // installation week sparklines
    rowHeadings.forEach((heading) => {
      sparkData = rows.filter((row) => { return row.woi === heading }).map((row) => { return parseInt(row.retained_percentage * 100) })
      $('#sparklineActual' + heading).sparkline(sparkData, sparklineOptions)
    })
  }

  window.RETENTION = {
    weeklyRetentionHandler
  }
})()
