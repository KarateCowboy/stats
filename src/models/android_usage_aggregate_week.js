
class AndroidUsageAggregateWeek{
  static scrub(record){
    if(record._id.platform !== 'androidbrowser'){
      record._id.platform = 'androidbrowser'
    }
    return record
  }
}

module.exports = AndroidUsageAggregateWeek