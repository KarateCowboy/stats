const moment = require('moment')
module.exports = () => {
  const now = moment().startOf('isoWeek')
  let currentMonth = now.format('MMMM YYYY')
  let results = []
  let current = {
    id: currentMonth,
    label: currentMonth,
    subitems: []
  }
  while (now.format('YYYY-MM-DD') > '2018-01-01') {
    if (now.format('MMMM YYYY') !== currentMonth) {
      results.push(current)
      currentMonth = now.format('MMMM YYYY')
      current = {
        id: currentMonth,
        label: currentMonth,
        subitems: []
      }
    }
    current.subitems.push({
      id: now.format('YYYY-MM-DD'),
      label: now.format('MMMM DD, YYYY'),
    })
    now.subtract(7, 'days')
  }
  results.push(current)
  return results
}
