/* global db */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const _ = require('lodash')
const ObjectionAdapter = require('factory-girl-objection-adapter')

const define = () => {
  factory.setAdapter(new ObjectionAdapter(), 'release')

  factory.define('release', db.Release, {
    brave_version: () => { return _.random(0, 4) + '.' + _.random(11, 99) + '.' + _.random(11, 99) },
    chromium_version: () => { return _.random(11, 99) + '.' + _.random(11, 99) + '.' + _.random(1000, 9999) + '.' + _.random(11, 99) },
    uses_hybrid_format: false
  })
  factory.setAdapter(new ObjectionAdapter(), 'hybrid-release')
  factory.extend('release', 'hybrid-release', {
    chromium_version: () => { return _.random(11, 99) + '.' + _.random(11, 99) + '.' + _.random(10, 99) + '.' + _.random(11, 99) },
    uses_hybrid_format: true
  })

  factory.setAdapter(new ObjectionAdapter(), 'release-with-crashes')
  factory.define('release-with-crashes', db.Release, (buildOptions = {}) => {
    const chromium_version = _.random(11, 99) + '.' + _.random(11, 99) + '.' + _.random(1000, 9999) + '.' + _.random(11, 99)
    return {
      brave_version: () => { return _.random(0, 4) + '.' + _.random(11, 99) + '.' + _.random(11, 99) },
      chromium_version: chromium_version,
      uses_hybrid_format: false,
      crashes: factory.assocMany('crash', 60)
    }
  })
}

module.exports.define = define
