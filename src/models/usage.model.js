/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const moment = require('moment')
const mongooseClient = require('mongoose')
const {AttachCommonMethods} = require('./usage_schema')
module.exports = function () {
  const {Schema} = mongooseClient
  let Usage = new Schema({
    year_month_day: {
      type: Schema.Types.String,
      required: [true, 'year_month_day is required'],
      default: moment().format('YYYY-MM-DD'),
      validate: {
        validator: function (v) {
          return /^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/.test(v)
        },
        message: 'year_month_day must be format YYYY-MM-DD'
      }
    },
    monthly: {type: Schema.Types.Boolean, required: [true, 'Boolean attribute \'monthly\' must be provided']},
    daily: {type: Schema.Types.Boolean, required: [true, 'Boolean attribute \'daily\' must be provided']},
    weekly: {type: Schema.Types.Boolean, required: [true, 'Boolean attribute \'weekly\' must be provided']},
    platform: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: function (v) { return ['osx', 'linux', 'winia32', 'winx64'].includes(v) }
      }
    },
    version: {
      type: Schema.Types.String,
      validate: {
        validator: function (v) {
          return /^[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}/.test(v)
        }
      }
    },
    first: {
      type: Schema.Types.Boolean,
      required: true
    },
    channel: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: function (v) {
          return ['beta', 'dev', 'stable', 'release'].includes(v)
        }
      }
    },
    woi: {
      type: Schema.Types.String,
      required: true,
      default: moment().startOf('week').add(1, 'days').format('YYYY-MM-DD'),
      validate: {
        validator: function (v) {
          return /^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/.test(v)
        }
      }
    },
    ref: {
      type: Schema.Types.String,
      default: 'none',
      validate: {
        validator: function (v) {
          return /^[A-Z0-9]{5,7}/.test(v) || ['none','others'].includes(v)
        }
      }
    },
    aggregated_at: {
      type: Schema.Types.String,
      required: false
    },
    ts: {
      type: Schema.Types.Number,
      default: moment().toDate().getTime()
    }

  }, {
    timestamps: true,
    collection: 'usage'
  })
  AttachCommonMethods(Usage)

  // put more instance and static methods after here
  Usage.virtual('aggregate_collection').get(() => 'usage_aggregate_woi')

  if (mongooseClient.models.Usage) {
    return mongooseClient.models.Usage
  } else {
    return mongooseClient.model('Usage', Usage)
  }
}
