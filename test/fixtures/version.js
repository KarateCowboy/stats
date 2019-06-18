/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const _ = require('lodash')
const {ObjectID} = require('mongodb')
const ObjectionAdapter = require('factory-girl-objection-adapter')

const define = () => {
  factory.setAdapter(new ObjectionAdapter(), 'version')

  factory.define('version', db.Version, {
    id: factory.sequence(),
    num: () => { return _.random(1,11) + '.' + _.random(1,11) + '.' + _.random(1,11) },
    created_at: () => { return new Date() },
    updated_at: () => { return new Date() }
  })
}

module.exports.define = define
