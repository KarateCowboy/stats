const moment = require('moment')
const _ = require('underscore')

module.exports = class AndroidUsageDayService {
  constructor () {
    this.collection = 'android_usage_aggregate_woi'
  }

  operation_week (usage_day) {
    return moment(usage_day._id.ymd).startOf('week').add(1, 'days').format('YYYY-MM-DD')
  }

  async three_month_spread (cutoff = null) {
    let start_woi
    if (cutoff) {
      start_woi = moment(cutoff).startOf('week').add(1, 'days').format('YYYY-MM-DD')
    } else {
      start_woi = moment().startOf('week').add(1, 'days').subtract(3, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD')
    }
    const this_week = moment().startOf('week').add(1, 'days').format('YYYY-MM-DD')
    const results = await mongo_client.collection(this.collection).find({
      '_id.woi': start_woi
    }).toArray()
    const grouped_results = _.groupBy(results, (i) => {return i._id.woi})
    const final_results = {}
    for (let woi in grouped_results) {
      final_results[woi] = {}
      let grouped_by_week = _.groupBy(grouped_results[woi], (ud) => { return this.operation_week(ud)})
      for (let week in grouped_by_week) {
        const week_total = grouped_by_week[week].reduce((sum, current) => { return sum + current.usages.length}, 0)
        final_results[woi][week] = week_total
      }
    }
    return final_results
  }
}