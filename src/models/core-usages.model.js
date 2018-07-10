/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const mongooseClient = require('mongoose')

module.exports = function () {
  const {Schema} = mongooseClient
  const CoreUsage = new Schema({
    year_month_day: {
      type: Schema.Types.String,
      required: [true, 'year_month_day is required'],
      validate: {
        validator: function (v) {
          return /^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/.test(v)
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
        validator: function (v) { return ['osx-bc', 'linux-bc', 'winia32-bc', 'winx64-bc'].includes(v) }
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
          return ['beta', 'dev', 'stable','release'].includes(v)
        }
      }
    },
    woi: {
      type: Schema.Types.String,
      required: true,
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
          return /^[A-Z0-9]{5,7}/.test(v) || v === 'none'
        }
      }
    },
    aggregated_at: {
      type: Schema.Types.Date,
      required: false
    }

  }, {
    timestamps: true,
    collection: 'brave_core_usage'
  })

  return mongooseClient.model('CoreUsage', CoreUsage)
}
