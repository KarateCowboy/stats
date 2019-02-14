(function () {
  // Standard configuration object for line graphs
  var standardYAxisOptions = {
    tooltips: {
      mode: 'x',
      position: 'nearest'
    },
    scales: {
      yAxes: [{
        gridLines: {
          drawBorder: false,
          drawOnChartArea: true,
        },
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }

  var safeDivide = function (n, d, def) {
    def = def || 0
    if (!d || d === 0) return def
    return n / d
  }

  var downloadObjectAs = (exportObj, exportName, mime) => {
    var dataStr = "data:" + mime + ";charset=utf-8," + encodeURIComponent(exportObj)
    var downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", exportName)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  window.STATS.COMMON = {
    standardYAxisOptions: standardYAxisOptions,
    safeDivide: safeDivide,
    downloadObjectAs: downloadObjectAs
  }
})()
