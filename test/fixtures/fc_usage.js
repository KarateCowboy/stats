/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global db */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectionAdapter = require('factory-girl-objection-adapter')
const _ = require('lodash')

const define = () => {
  factory.setAdapter(new ObjectionAdapter(), 'fc_usage')
  factory.define('fc_usage', db.UsageSummary, {
    ymd: () => moment().subtract(1, 'months').format(),
    platform: 'winx64',
    version: '0.12.4',
    channel: 'dev',
    first_time: true,
    total: 200,
    ref: () => { return db.ReferralCode.randomCodeText() }
  })
  factory.setAdapter(new ObjectionAdapter(), 'linux-core-fcusage')
  factory.extend('fc_usage', 'linux-core-fcusage', {
    ymd: () => moment().subtract(1, 'months').format(),
    platform: 'linux-bc',
    version: () => { return `67.${_.random(10, 99)}.${_.random(10, 99)}` },
    channel: 'dev',
    first_time: true,
    total: 200,
    ref: () => { return db.ReferralCode.randomCodeText() }
  }
  )
}

module.exports.define = define
