/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const mongoose = require('mongoose')

const joi = require('joi')
const moment = require('moment')

const schema = joi.object().keys({
  _id: joi.object({
    woi: joi.string().regex(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/).required(),
    ymd: joi.string().regex(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/).required(),
    platform: joi.string().valid('ios', 'android', 'androidbrowser', 'osx', 'winia32', 'winx64', 'linux', 'unknown', 'osx-bc', 'linux-bc', 'winx64-bc', 'winia32-bc').required(),
    version: joi.string().regex(/[\d]{1,2}\.[\d]{1,2}\.[\d]{1,2}/).required(),
    first_time: joi.boolean().required(),
    channel: joi.any().valid('beta', 'stable', 'developer', 'nightly', 'dev').required(),
    ref: joi.any().optional()
  }).required(),
  total: joi.number().min(1).required(),
  usages: joi.array()
})

class UsageAggregateUtil {
  static is_valid (record) {
    try {
      const result = joi.validate(record, schema)
      if (result.error) {
        return false
      }
      if (moment(record._id.ymd).isBefore(moment(record._id.woi))) {
        return false
      }
    } catch (e) {
      return false
    }
    return true
  }

  static scrub (record) {
    if (record._id.woi.match(/[\d]{4,4}-[\d]{1,1}-/)) {
      const woi = record._id.woi.split('')
      woi.splice(5, 0, '0')
      record._id.woi = woi.join('')
    }
    if (record._id.woi.match(/[\d]{4,4}-[\d]{2,2}-[\d]{1,1}$/)) {
      const woi = record._id.woi.split('')
      woi.splice(8, 0, '0')
      record._id.woi = woi.join('')
    }
    if (record._id.ymd.match(/[\d]{4,4}-[\d]{1,1}-/)) {
      const ymd = record._id.ymd.split('')
      ymd.splice(5, 0, '0')
      record._id.ymd = ymd.join('')
    }
    if (record._id.ymd.match(/[\d]{4,4}-[\d]{2,2}-[\d]{1,1}$/)) {
      const ymd = record._id.ymd.split('')
      ymd.splice(8, 0, '0')
      record._id.ymd = ymd.join('')
    }
    if (record._id.version.match(/[\d]{1,2}(\.[\d]{1,2}){2,2}/) === null) {
      record._id.version = `${record._id.version.trim()}.0`
    }
    return record
  }

  static async transfer_to_retention_woi (record) {
    try {
      if (record.usages.length > 0 && (record._id.ref === 'none' || !!record._id.ref.match(/[A-Z0-9]{6,6}/)) && record._id.version.match(/^[\d]+\.[\d]+\.[\d]+$/gm)) {
        await knex('dw.fc_retention_woi').insert({
          ymd: record._id.ymd,
          platform: record._id.platform,
          version: record._id.version,
          channel: record._id.channel,
          woi: record._id.woi,
          ref: record._id.ref,
          total: record.usages.length
        })
      }
    } catch (e) {
      if (e.message.includes('duplicate key value violates unique constraint "fc_retention_woi_pkey"')) {
        await knex('dw.fc_retention_woi').increment('total', record.usages.length)
          .where({
            ymd: record._id.ymd,
            platform: record._id.platform,
            version: record._id.version,
            channel: record._id.channel,
            woi: record._id.woi,
            ref: record._id.ref
          })
      } else {
        console.log(record._id)
        throw e
      }
    }
  }

}

const db_schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.Mixed,
  usages: [mongoose.Schema.Types.Mixed]
}, {
  timestamps: true,
  collection: 'usage_aggregate_woi'
})

db_schema.statics.woi_for_weeks_ago = function (weeks) {
  return moment().subtract(weeks, 'weeks').startOf('week').add(1, 'days')
}
db_schema.methods.find_usages = async function () {
  const usages_cursor = await mongo_client.collection('usage').find({
    daily: true,
    woi: this._id.woi,
    year_month_day: this._id.ymd,
    ref: this._id.ref,
    platform: this._id.platform,
    channel: this._id.channel,
    first: this._id.first
  })
  let all_usages = []
  while (await usages_cursor.hasNext()) {
    const current = await usages_cursor.next()
    this.usages.push(current._id)
    all_usages.push(current)
  }
  this.usages = _.uniq(this.usages)
  return all_usages
}

const UsageAggregate = mongoose.model('UsageAggregate', db_schema)
module.exports.UsageAggregate = UsageAggregate

module.exports.UsageAggregateUtil = UsageAggregateUtil
module.exports.schema = schema
