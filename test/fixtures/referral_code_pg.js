/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const _ = require('lodash')
const ObjectID = require('mongodb').ObjectID

const define = () => {
  factory.setAdapter(new FactoryGirl.BookshelfAdapter(), 'ref_code_pg')

  factory.define('ref_code_pg', db.ReferralCode, {
      'code_text': () => { let o = new ObjectID(); return _.shuffle(o.toString()).join('').slice(0,6).toUpperCase() },
      'campaign_id': () => _.random(2000)
    }
  )
}

module.exports.define = define
