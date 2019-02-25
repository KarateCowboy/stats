'use strict'
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const {ObjectID} = require('mongodb')
const {Util} = require('../../src/models/util')
const faker = require('faker')
const ObjectionAdapter = require('factory-girl-objection-adapter')

const define = () => {
  factory.setAdapter(new ObjectionAdapter(), 'channel')

  class Channel {
    async save () {
      await knex('dtl.channels').insert(this.toJSON())
    }

    async destroy () {
      await knex('dw.channels').where('channel', this.channel)
    }

  }

  factory.define('channel', db.Channel, {
      channel: 'dev',
      label: 'Release',
      description: 'Release channel'
    }
  )
}

module.exports.define = define
