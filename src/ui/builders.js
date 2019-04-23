// const {round, td, ptd, th, tr, st, td, st1, st3, stp, b, std} = require('../../src/ui/builders')

module.exports.round = function (x, n) {
  n = n || 0
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}
module.exports.td = function (contents, align, opts) {
  contents = contents || ''
  align = align || 'left'
  opts = opts || {}
  return '<td class="text-' + align + '">' + contents + '</td>'
}

module.exports.ptd = function (val, per, align, opts) {
  contents = contents || ''
  align = align || 'left'
  opts = opts || {}
  return '<td class="text-' + align + '">' + val + ' <span class="subvalue">' + per + '</span></td>'
}

module.exports.th = function (contents, align, opts) {
  contents = contents || ''
  align = align || 'left'
  opts = opts || {}
  return '<th class="text-' + align + '">' + contents + '</th>'
}

module.exports.tr = function (tds, opts) {
  tds = tds || []
  opts = opts || {}
  var buf = '<tr '
  if (opts.classes) {
    buf += ' class="' + opts.classes + '" '
  }
  buf += '>' + tds.join('') + '</tr>'
  return buf
}

// standard dollar number format i.e. 123,456.78
module.exports.std = function (num) {
  return numeral(num).format('0,0.00')
}

// standard integer number format i.e. 123,456
module.exports.st = function (num) {
  return numeral(num).format('0,0')
}

// standard integer number format i.e. 123,456. thousands are converted
// to 99k format, millions are converted to 99m
module.exports.ste = function (num) {
  if (num < 1000) {
    return numeral(num).format('0,0')
  } else if (num < 1000000) {
    return module.exports.st1(num / 1000) + 'k'
  } else {
    return module.exports.st1(num / 1000000) + 'm'
  }
}

// standard number format i.e. 123,456.7
module.exports.st1 = function (num) {
  return numeral(num).format('0,0.0')
}

// standard number format i.e. 123,456.7
module.exports.st3 = function (num) {
  return numeral(num).format('0,0.000')
}

// standard percentage form i.e. 45.3%
module.exports.stp = function (num) {
  return numeral(num).format('0.0%')
}

module.exports.b = function (text) { return '<strong>' + text + '</strong>' }


