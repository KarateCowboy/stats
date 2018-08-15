/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const { ObjectID } = require('mongodb')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class UsageAggregateWOI {
    async save () {
        await mongo_client.collection('ios_usage_aggregate_woi').save(this)
    }

    async destroy () {
        await mongo_client.collection('ios_usage_aggregate_woi').remove({ '_id': this._id})
    }
  }

  factory.define('ios_usage_aggregate_woi', UsageAggregateWOI, {
    '_id': {
      'ymd': () => moment().subtract(2, 'months').add(3,'days').format('YYYY-MM-DD'),
      'platform': 'ios',
      'version': '1.0.1',
      'first_time': false,
      'channel': 'beta',
      'woi': () => moment().subtract(2, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
      'ref': 'none'
    },
    'total': 1,
    usages: () => { return [ new ObjectID() ] }

  })
}
module.exports.define = define
