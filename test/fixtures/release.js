/* global db */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const _ = require('lodash')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  factory.define('release', db.Release, {
    brave_version: () => { return _.random(0, 4) + '.' + _.random(11, 99) + '.' + _.random(11, 99) },
    chromium_version: () => { return _.random(11, 99) + '.' + _.random(11, 99) + '.' + _.random(1000, 9999) + '.' + _.random(11, 99) },
    uses_hybrid_format: false
  })
  factory.extend('release', 'hybrid-release', {
    chromium_version: () => { return _.random(11, 99) + '.' + _.random(11, 99) + '.' + _.random(10, 99) + '.' + _.random(11, 99) },
    uses_hybrid_format: true
  })
}

module.exports.define = define
