const GenericUsageDayService = require('./generic-usage-day.service')

module.exports = class CoreUsageDayService extends GenericUsageDayService {
  constructor () {
    super()
    this.collection = 'brave_core_usage_aggregate_woi'
  }
}
