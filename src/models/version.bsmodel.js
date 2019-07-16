/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Joi = require('joi')
const Schema = require('./validators/version')
const _ = require('lodash')
const {ref} = require('objection')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Version extends BaseModel {
    get schema () {
      return Schema
    }

    static get jsonSchema () {
      return {
        id: {type: 'integer'},
        num: {type: 'string'},
        created_at: {type: 'date'},
        updated_at: {type: 'date'}
      }
    }

    static get idColumn () {
      return 'id'
    }

    static get tableName () {
      return 'dtl.versions'
    }

    static get relationMappings () {
      return {
        crashes: {
          relation: BaseModel.HasManyRelation,
          modelClass: db.Crash,
          join: {
            from: 'dtl.versions.num',
            to: ref('dtl.crashes.contents:_version').castText()
          }
        }
      }

    }
  }

  return Version
}
