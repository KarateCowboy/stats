(function () {
  // High contrast color palette
  // (https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors)
  var colors = [
    [31, 119, 180],
    [174, 199, 232],
    [255, 127, 14],
    [255, 187, 120],
    [44, 160, 44],
    [152, 223, 138],
    [214, 39, 40],
    [255, 152, 150],
    [148, 103, 189],
    [197, 176, 213],
    [140, 86, 75],
    [196, 156, 148],
    [227, 119, 194],
    [247, 182, 210],
    [127, 127, 127],
    [199, 199, 199],
    [188, 189, 34],
    [219, 219, 141],
    [23, 190, 207],
    [158, 218, 229]
  ]

  // used by colorForHashedLabel
  String.prototype.hashCode = function() {
    var hash = 0, i, chr
    if (this.length === 0) return hash
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i)
      hash  = ((hash << 5) - hash) + chr
      hash |= 0; // Convert to 32bit integer
    }
    return (hash >>> 0)
  }

  // Return an rgba(x, x, x, x) text string by label
  var colorForLabel = function (label, opacity) {
    return colorForIndex({
      'winx64': 0,
      'winia32': 1,
      'osx': 2,
      'linux': 3,
      'winx64-bc': 0,
      'winia32-bc': 1,
      'osx-bc': 2,
      'linux-bc': 3,
      'ios': 4,
      'android': 5,
      'Link Bubble': 5,
      'androidbrowser': 5,
      'Android Browser': 5
    }[label] || 0, opacity)
  }

  // Return an rgba(x, x, x, x) text string by index
  var colorForIndex = function (idx, opacity) {
    opacity = opacity || 1
    idx = idx % colors.length
    return 'rgba(' + colors[idx][0] + ', ' + colors[idx][1] + ', ' + colors[idx][2] + ', ' + opacity + ')'
  }

  const colorForHashedLabel = (label, opacity) => {
    const idx = (label.toUpperCase().hashCode() + 5) % colors.length
    return 'rgba(' + colors[idx][0] + ', ' + colors[idx][1] + ', ' + colors[idx][2] + ', ' + opacity + ')'
  }

  window.STATS.COLOR = {
    colorForIndex: colorForIndex,
    colorForLabel: colorForLabel,
    colorForHashedLabel: colorForHashedLabel
  }
})()
