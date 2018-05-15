/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const joi = require('joi')
const moment = require('moment')

const schema = joi.object().keys({
  _id: joi.object({
    woi: joi.string().regex(/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/).required(),
    ymd: joi.string().regex(/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/).required(),
    platform: joi.string().valid('ios', 'android', 'androidbrowser', 'osx', 'winia32', 'winx64', 'linux', 'unknown').required(),
    version: joi.string().regex(/[\d]{1,2}\.[\d]{1,2}\.[\d]{1,2}/).required(),
    first_time: joi.boolean().required(),
    channel: joi.any().valid('beta', 'stable', 'developer', 'nightly', 'dev').required(),
    ref: joi.any().optional()
  }).required(),
  count: joi.number().min(1).required()
})

class UsageAggregateWOI {
  static is_valid (record) {
    try {
      const result = joi.validate(record, schema)
      if (result.error) {
        return false
      }
      if (moment(record._id.ymd).isBefore(moment(record._id.woi))) {
        return false
      }
    }
    catch (e) {
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
      await knex('dw.fc_retention_woi').insert({
        ymd: record._id.ymd,
        platform: record._id.platform,
        version: record._id.version,
        channel: record._id.channel,
        woi: record._id.woi,
        ref: record._id.ref,
        total: record.count
      })

    } catch (e) {
      if (e.message.includes('duplicate key value violates unique constraint "fc_retention_woi_pkey"')) {
        await knex('dw.fc_retention_woi').increment('total', record.count)
          .where({
            ymd: record._id.ymd,
            platform: record._id.platform,
            version: record._id.version,
            channel: record._id.channel,
            woi: record._id.woi,
            ref: record._id.ref
          })
      }
    }
  }

}

module.exports.UsageAggregateWOI = UsageAggregateWOI
