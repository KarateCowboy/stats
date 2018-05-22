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

  class FcRetentionWoi {
    async save () {
      await knex('dw.fc_retention_woi').insert({
        ymd: this.ymd,
        platform: this.platform,
        version: this.version,
        woi: this.woi,
        channel: this.channel,
        total: this.total,
        ref: this.ref
      })
    }

    async destroy () {
      await knex('dw.fc_retention_woi').delete({
        ymd: this.ymd,
        platform: this.platform,
        version: this.version,
        woi: this.woi,
        channel: this.channel,
        total: this.total,
        ref: this.ref
      })
    }
  }

  factory.define('fc_retention_woi', FcRetentionWoi, {
      ymd: () => moment().subtract(4, 'weeks').format(),
      platform: 'winx64',
      version: '0.12.4',
      woi: () => moment().subtract(7, 'weeks').format(),
      channel: 'dev',
      total: () => Math.floor(Math.random(500) * 1000),
      ref: 'none'
    }
  )
}

module.exports.define = define
