(() => {
  const positiveColor = net.brehaut.Color('#00ff00')
  const negativeColor = net.brehaut.Color('#333333')
  const white = net.brehaut.Color('#ffffff')

  const table = (selector, correlations, opts={}) => {
    const element = selector()
    console.log(selector, correlations, opts)
    let buf = `<table class='table'>`
    let labels = new Set()
    _.each(correlations, (v, k) => {
      let [a, b] = k.split(':')
      labels.add(a)
      labels.add(b)
    })
    buf += `<tr><th></th>`
    for (let label of labels.keys()) {
      buf += `<th>${label.replace(/_/g, ' ')}</th>`
    }
    buf += `</tr>`
    for (let l1 of labels.keys()) {
      buf += `<tr><td width="10%"><strong>${l1.replace(/_/g, ' ')}</strong></td>`
      const cellWidth = 90 / labels.size
      for (let l2 of labels.keys()) {
        let v = correlations[l1 + ':' + l2]
        let cellColor, displayCorrelation

        if (l1 === l2) {
          cellColor = white
          displayCorrelation = ''
        } else {
          displayCorrelation = Math.round(v * 100)
          cellColor = v > 0 ?
            positiveColor.lightenByAmount(1 - v) :
            negativeColor.lightenByAmount(1 - v * -1)
        }

        buf += `<td class='text-center' width="${cellWidth}%" style="background-color: ${cellColor}"><strong>${displayCorrelation}</strong></td>`
      }
      buf += `</tr>`
    }
    element.append(buf)
  }

  window.STATS.CORRELATION = {}
  window.STATS.CORRELATION.table = table
})()
