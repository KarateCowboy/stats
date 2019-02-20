/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const moment = require('moment')
const mongooseClient = require('mongoose')
const countries = require('../../src/isomorphic/countries')
const {AttachCommonMethods} = require('./usage_schema')
const _ = require('lodash')
module.exports = function () {
  const {Schema} = mongooseClient
  let CoreUsage = new Schema({
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
    doi: {
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
          return /^[A-Z0-9]{5,7}/.test(v) || ['none', 'others'].includes(v)
        }
      }
    },
    country_code: {
      type: Schema.Types.String,
      default: 'unknown',
      validate: {
        validator: function (v) {
          const allCodes = _.flatten(countries.map(r => r.subitems)).map(i => i.id)
          allCodes.push('unknown')
          return _.includes(allCodes, v)
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
    collection: 'brave_core_usage'
  })
  AttachCommonMethods(CoreUsage)

  // put more instance and static methods after here
  CoreUsage.virtual('aggregate_collection').get(() => 'brave_core_usage_aggregate_woi')

  if (mongooseClient.models.CoreUsage) {
    return mongooseClient.models.CoreUsage
  } else {
    return mongooseClient.model('CoreUsage', CoreUsage)
  }
}
