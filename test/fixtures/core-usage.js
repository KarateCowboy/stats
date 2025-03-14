/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const CoreUsage = require('../../src/models/core-usage.model.js')()
const _ = require('underscore')
const countries = require('../../src/isomorphic/countries')

const define = () => {

  factory.setAdapter(new FactoryGirl.MongooseAdapter(), 'core_winx64_usage')

  factory.define('core_winx64_usage', CoreUsage, {
    '_id': () => { return (new ObjectID()) },
    'daily': true,
    'weekly': true,
    'monthly': true,
    'platform': 'winx64-bc',
    'version': '67.1.2',
    'first': true,
    'channel': 'dev',
    'doi': () => moment().subtract(2, 'months').startOf('week').add(3, 'days').format('YYYY-MM-DD'),
    'woi': () => moment().subtract(2, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
    'ref': () => _.shuffle((new ObjectID()).toString().split('')).join('').toUpperCase().slice(0, 6),
    'ts': () => moment().subtract(2, 'months').startOf('week').add(5, 'days').toDate().getTime(),
    'year_month_day': () => moment().subtract(2, 'months').startOf('week').add(5, 'days').format('YYYY-MM-DD'),
    'country_code': () => { return _.sample(_.flatten(countries.map(r => r.subitems)).map(c => c.id)) }
  })
}

module.exports.define = define

