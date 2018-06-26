/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const {ReferralCode} = require('../../src/models/mongoose/referral_code')
const _ = require('underscore')

const define = () => {
  factory.setAdapter(new FactoryGirl.MongooseAdapter(),'referral_code')

  factory.define('referral_code', ReferralCode, {
    '_id': () => { return (new ObjectID()) },
    'code_text': () => { return _.shuffle((new ObjectID()).toString().slice(0, 6).toUpperCase().split('')).join('')},
    'platform': 'winx64',
    usages: () => {
      return [(new ObjectID()).toString(), (new ObjectID()).toString()]
    }
  })
}

module.exports.define = define
