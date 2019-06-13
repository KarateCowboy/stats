const _ = require('underscore')
const tt = require('text-table')
const MONTHS = 4
const numeral = require('numeral')

const f = (v) => {
  return numeral(v).format('0,0')
}

const d = JSON.parse(require('fs').readFileSync('d.json'))
let combined = d.combined
let months = d.months

let table = []
let platforms = _.keys(combined[0])
let row = ['']
for (let i = 0; i < MONTHS; i++) {
  row.push(months[i])
  if (i === 0) {
    row.push('prev mth diff')
    row.push('prev mth % diff')
    row.push('max mth diff')
  }
}
table.push(row)

const platformMaxes = {}
for (let platform of platforms) {
  platformMaxes[platform] = _.max(_.rest(combined.map((m) => {
    return m[platform]
  })))
}

for (let platform of platforms) {
  let row = [platform]
  for (let i = 0; i < MONTHS; i++) {
    row.push(f(combined[i][platform] || 0))
    if (i === 0) {
      let delta = (combined[i][platform] || 0) - (combined[i+1][platform] || 0)
      let deltap = delta / (combined[i+1][platform] || 0)
      let mdelta = (combined[i][platform] || 0) - platformMaxes[platform]
      row.push(f(delta))
      row.push(numeral(deltap).format('0%'))
      row.push(f(mdelta))
    }
  }
  table.push(row)
}

let monthSums = []
for (let i = 0; i < MONTHS; i++) {
  s = 0
  for (let platform of platforms) {
    s += (combined[i][platform] || 0)
  }
  monthSums[i] = s
}
let monthMax = _.max(monthSums)

row = ['']
for (let i = 0; i < MONTHS; i++) {
  row.push(f(monthSums[i]))
  if (i === 0) {
    let delta = monthSums[i] - monthSums[i+1]
    let mdelta = monthSums[i] - monthMax
    let deltap = (monthSums[i] - monthSums[i+1]) / monthSums[i+1]
    row.push(f(delta))
    row.push(numeral(deltap).format('0%'))
    row.push(f(mdelta))
  }
}
table.push(row)

console.log(tt(table, {
  align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r']
}))
