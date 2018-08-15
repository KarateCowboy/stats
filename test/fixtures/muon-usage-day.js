/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const {ObjectID} = require('mongodb')
const MuonUsageDay = require('../../src/models/muon-usage-day.model')()

const define = () => {
  factory.setAdapter(new FactoryGirl.MongooseAdapter(), 'muon_usage_day')

  factory.define('muon_usage_day', MuonUsageDay, {
    '_id': {
      'ymd': () => moment().subtract(2, 'months').format('YYYY-MM-DD'),
      'platform': 'winx64',
      'version': '67.1.2',
      'first_time': false,
      'channel': 'release',
      'woi': () => moment().subtract(2, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
      'ref': 'none'
    },
    'total': 1,
    usages: () => { return [new ObjectID()]}
  })
}
module.exports.define = define
