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

const define = () => {
  factory.setAdapter(new FactoryGirl.SequelizeAdapter(), 'campaign')

  factory.define('campaign', db.Campaign, {
      name: () => { return `${faker.name.findName()} Promotional Campaign`}
    }
  )
}

module.exports.define = define
