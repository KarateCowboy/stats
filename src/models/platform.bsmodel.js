/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Joi = require('joi')
const Schema = require('./validators/platform')
module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Platform extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dtl.platforms'
    }
  }

  return Platform
}

