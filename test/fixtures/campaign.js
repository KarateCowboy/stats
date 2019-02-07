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
const ObjectionAdapter  = require('factory-girl-objection-adapter')

const define = () => {
  factory.setAdapter(new ObjectionAdapter(), 'campaign')

  class Campaign {
    async save(){
      await knex('dtl.campaigns').insert(this.toJSON())
    }
    async destroy(){
      await knex('dw.')
    }


  }

  factory.define('campaign', db.Campaign, {
      name: () => { return `${faker.name.findName()} Promotional Campaign`}
    }
  )
}

module.exports.define = define
