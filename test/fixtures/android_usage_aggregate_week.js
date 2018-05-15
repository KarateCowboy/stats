/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const _ = require('underscore')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class AndroidUsageAggregateWOI {
    async save () {
      await mongo_client.collection('android_usage_aggregate_woi').insert(this)
    }

    async destroy () {
      await mongo_client.collection('android_usage_aggregate_woi').destroy({'_id': this._id})
    }
  }

  factory.define('android_usage_aggregate_woi', AndroidUsageAggregateWOI, {
    '_id': {
      'ymd': () => moment().subtract(1, 'months').format('YYYY-MM-DD'),
      'platform': 'androidbrowser',
      'version': '1.0.42',
      'first_time': false,
      'channel': 'stable',
      'woi': () => moment().subtract(2, 'months').startOf('week').add(5, 'days').format('YYYY-MM-DD'),
      'ref': () => _.shuffle((new ObjectID()).toString().split('')).join('').toUpperCase().slice(0, 6)
    },
    'count': () => (Math.random() * 100).toFixed(0)
  })

}

module.exports.define = define

