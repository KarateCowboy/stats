/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class Usage {
    async save () {
      await mongo_client.collection('usage').insert({
          '_id': this._id,
          'daily': this.daily,
          'weekly': this.weekly,
          'monthly': this.monthly,
          'platform': this.platform,
          'version': this.version,
          'first': this.first,
          'channel': this.channel,
          'woi': this.woi,
          'ref': this.ref,
          'ts': this.ts,
          'year_month_day': this.year_month_day
        }
      )
    }

    async destroy () {
      await mongo_client.collection('usage').destroy({'_id': this._id})
    }
  }

  factory.define('link_bubble_usage', Usage, {
    '_id': () => { return (new ObjectID()) },
    'daily': true,
    'weekly': true,
    'monthly': true,
    'platform': 'android',
    'version': '1.0.42',
    'first': true,
    'channel': 'stable',
    'woi': () => moment().subtract(2, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
    'ref': () => (new ObjectID()).toString().toUpperCase().slice(0, 6),
    'ts': () => moment().subtract(2, 'months').startOf('week').add(5, 'days').toDate().getTime(),
    'year_month_day': () => moment().subtract(2, 'months').startOf('week').add(5, 'days').format('YYYY-MM-DD')
  })
}

module.exports.define = define
