/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Joi = require('joi')
const Schema = require('./validators/channel')
module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Channel extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dtl.channels'
    }
    static get idColumn(){
      return 'channel'
    }
  }

  return Channel
}

