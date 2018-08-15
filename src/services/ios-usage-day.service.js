const GenericUsageDayService = require('./generic-usage-day.service')

module.exports = class IosUsageDayService extends GenericUsageDayService {
  constructor () {
    super()
    this.collection = 'ios_usage_aggregate_woi'
  }
}
