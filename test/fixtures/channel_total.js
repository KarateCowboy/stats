/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('lodash')
const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const {ObjectID} = require('mongodb')
const ChannelTotal = require('../../src/models/channel_total.model')()

const define = () => {
  factory.setAdapter(new FactoryGirl.MongooseAdapter(), 'channel_total')

  factory.define('channel_total', ChannelTotal, {
    _id: () => (new ObjectID()),
    twitch: () => _.random(500, 20000),
    vimeo: () => _.random(500, 20000),
    github: () => _.random(500, 20000),
    twitter: () => _.random(500, 20000),
    reddit: () => _.random(500, 20000),
    youtube: () => _.random(500, 20000),
    site: () => _.random(500, 20000),
    all_channels: () => _.random(500, 20000),
    createdAt: () => moment().toDate(),
    updatedAt: () => moment().toDate()
  })
}
module.exports.define = define
