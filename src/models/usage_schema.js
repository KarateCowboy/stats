const instance_methods = {
  usage_day_id: function () {
    return {
      '_id.ymd': this.year_month_day,
      '_id.platform': this.platform,
      '_id.version': this.version,
      '_id.channel': this.channel,
      '_id.woi': this.woi,
      '_id.ref': this.ref || 'none',
      '_id.first_time': this.first
    }
  }
}

const static_methods = {
  for_day: async function (year_month_day, beginning = undefined, end = undefined) {
    params = {
      daily: true,
      year_month_day: year_month_day,
      aggregated_at: {
        $in: [false, null, undefined]
      }
    }
    if (beginning || end) {
      params.woi = {}
      if (beginning) {
        params.woi['$gte'] = beginning
      }
      if (end) {
        params.woi['$lte'] = end
      }
    }
    return await this.find(params)
  }
}
module.exports.AttachCommonMethods = function (schema) {
  for (let key in instance_methods) {
    schema.methods[key] = instance_methods[key]
  }
  for (let key in static_methods) {
    schema.statics[key] = static_methods[key]
  }
}
module.exports.InstanceMethods = instance_methods
module.exports.StaticMethods = static_methods