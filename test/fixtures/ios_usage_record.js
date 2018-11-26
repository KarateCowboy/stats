/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const IosUsage = require('../../src/models/ios-usage.model.js')()

const define = () => {
  factory.setAdapter(new FactoryGirl.MongooseAdapter())

  factory.define('ios_usage', IosUsage, {
    '_id': () => (new ObjectID()),
    'daily': true,
    'weekly': true,
    'monthly': true,
    'platform': 'ios',
    'version': '1.5.1',
    'first': true,
    'channel': 'stable',
    'woi': () => moment().subtract(2, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
    'ref': 'none',
    'ts': () => moment().subtract(2, 'months').toDate().getTime(),
    'year_month_day': () => moment().subtract(2, 'months').format('YYYY-MM-DD')

  })
  factory.extend('ios_usage', 'ios_usage_bad_woi', {
    'woi': '12-34-56'
  })
  factory.extend('ios_usage', 'ios_usage_malformed_woi', {
    'woi': () => {
      const date = moment().subtract(3, 'months').format('YYYY-MM-DD').split('')
      date.splice(5, 1)
      date.splice(7, 1)
      return date.join('')
    }
  })

}
module.exports.define = define

