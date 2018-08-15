const GenericUsageDayService = require('./generic-usage-day.service')

module.exports = class MuonUsageDayService extends GenericUsageDayService {
  constructor () {
    super()
    this.collection = 'usage_aggregate_woi'
  }
}
