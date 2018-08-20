const GenericeUsageDayService = require('./generic-usage-day.service')

module.exports = class AndroidUsageDayService extends GenericeUsageDayService {
  constructor () {
    super()
    this.collection = 'android_usage_aggregate_woi'
  }
}
