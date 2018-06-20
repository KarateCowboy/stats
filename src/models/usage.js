/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const mongoose = require('mongoose')
const  UsageAggregateWOI  = require('./usage_aggregate_woi').UsageAggregateWOI

current_woi = () => { moment().startOf('week').add(1, 'days').format('YYYY-MM-DD') }

const UsageSchema = new mongoose.Schema({
  year_month_day: {type: String},
  woi: {type: String},
  ref: {type: String},
  platform: {type: String},
  version: {type: String},
  channel: {type: String},
  daily: Boolean,
  weekly: Boolean,
  monthly: Boolean,
  first: Boolean,
  ts: {type: Number},
  aggregated_at: {type: Date}
}, {
  timestamps: true,
  collection: 'usage'
})

UsageSchema.methods.daily_agg_id = function () {
  return {
    ymd: this.year_month_day,
    platform: this.platform,
    version: this.version,
    first_time: this.first_time,
    channel: this.channel,
    woi: this.woi,
    ref: this.ref
  }
}
UsageSchema.methods.aggregate_to_usage_woi = async function () {
  let usage_agg_woi = await UsageAggregateUtil.findOne({_id: this.daily_agg_id()})
  if(!!usage_agg_woi){
    usage_agg_woi = new UsageAggregateWOI({ _id: this.daily_agg_id(), count: 1, usages:[ this._id] })
  }else{
    usage_agg_woi.count++
    usage_agg_woi.usages.push(this._id)
  }
  await usage_agg_woi.save()
}

module.exports.UsageSchema = UsageSchema

const Usage = mongoose.model('Usage', UsageSchema)
module.exports.Usage = Usage
