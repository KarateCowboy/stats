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
  let Platform = new Schema({
    name: {
      type: Schema.Types.String,
      required: [true, 'platform attribute "name" is required']
    },
    versions: {
      type: Schema.Types.Array,
      required: true
    }
  }, {
    timestamps: true,
    collection: 'platforms'
  })
  AttachCommonMethods(Platform)

  // put more instance and static methods after here

  if (mongooseClient.models.Platform) {
    return mongooseClient.models.Platform
  } else {
    return mongooseClient.model('Platform', Platform)
  }
}
