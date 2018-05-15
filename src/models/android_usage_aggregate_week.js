
class AndroidUsageAggregateWOI{
  static scrub(record){
    if(record._id.platform !== 'androidbrowser'){
      record._id.platform = 'androidbrowser'
    }
    return record
  }
}

module.exports = AndroidUsageAggregateWOI