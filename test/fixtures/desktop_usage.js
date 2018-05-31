/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const { Usage } = require('../../src/models/usage')

const define = () => {

  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  factory.define('winx64_usage', Usage, {
    // '_id': () => { return (new ObjectID()) },
    'daily': true,
    'weekly': true,
    'monthly': true,
    'platform': 'winx64',
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

