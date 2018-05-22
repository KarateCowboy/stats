/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class FcUsageMonth {
    async save () {
      await knex('dw.fc_usage_month').insert({
        ymd: this.ymd,
        platform: this.platform,
        version: this.version,
        channel: this.channel,
        total: this.total,
        ref: this.ref
      })
    }

    async destroy () {
      await knex('dw.fc_usage_month').delete({
        ymd: this.ymd,
        platform: this.platform,
        version: this.version,
        channel: this.channel,
        total: this.total,
        ref: this.ref
      })
    }
  }

  factory.define('fc_usage_month', FcUsageMonth, {
    ymd: () => moment().add(1, 'months').format(),
    platform: 'winx64',
    version: '0.12.4',
    channel: 'dev',
    total: 200,
    ref: 'none'
  })
}

module.exports.define = define