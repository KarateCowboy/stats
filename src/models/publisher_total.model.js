/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const moment = require('moment')
const _ = require('lodash')
const mongooseClient = require('mongoose')

module.exports = function () {
  const {Schema} = mongooseClient
  let PublisherTotal = new Schema({
    email_verified_with_a_verified_channel_and_uphold_verified: {
      type: Schema.Types.Number,
      default: 0
    },
    email_verified_with_a_verified_channel: {
      type: Schema.Types.Number,
      default: 0
    },
    email_verified_with_a_channel: {
      type: Schema.Types.Number,
      default: 0
    },
    email_verified: {
      type: Schema.Types.Number,
      default: 0
    },
    email_verified_with_a_verified_channel_and_uphold_kycd: {
      type: Schema.Types.Number,
      default: 0
    },
    email_verified_and_uphold_kycd: {
      type: Schema.Types.Number,
      default: 0
    },
  }, {
    collection: 'publisher_totals',
    timestamps: true
  })
  // put more instance and static methods after here

  if (mongooseClient.models.PublisherTotal) {
    return mongooseClient.models.PublisherTotal
  } else {
    return mongooseClient.model('PublisherTotal', PublisherTotal)
  }
}


