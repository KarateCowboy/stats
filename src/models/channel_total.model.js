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
  let ChannelTotal = new Schema({
    twitch: {
      type: Schema.Types.Number,
      default: 0
    },
    youtube: {
      type: Schema.Types.Number,
      default: 0
    },
    site: {
      type: Schema.Types.Number,
      default: 0
    },
    all_channels: {
      type: Schema.Types.Number,
      default: 0
    },
  }, {
    collection: 'channel_totals',
    timestamps: true
  })
  // put more instance and static methods after here

  if (mongooseClient.models.ChannelTotal) {
    return mongooseClient.models.ChannelTotal
  } else {
    return mongooseClient.model('ChannelTotal', ChannelTotal)
  }
}


