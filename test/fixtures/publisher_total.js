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
const PublisherTotal = require('../../src/models/publisher_total.model')()

const define = () => {
  factory.setAdapter(new FactoryGirl.MongooseAdapter(), 'publisher_total')

  factory.define('publisher_total', PublisherTotal, {
    _id: () => (new ObjectID()),
    'email_verified_with_a_verified_channel_and_uphold_verified': _.random(500, 20000),
    'email_verified_with_a_verified_channel': _.random(500, 20000),
    'email_verified_with_a_channel': _.random(500, 20000),
    'email_verified': _.random(500, 20000),
    createdAt: () => moment().toDate(),
    updatedAt: () => moment().toDate()
  })
}
module.exports.define = define
