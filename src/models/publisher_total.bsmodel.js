/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Schema = require('./validators/publisher_totals')
const Joi = require('joi')
const _ = require('lodash')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class PublisherTotal extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dw.publisher_totals'
    }

    static get relationMappings () {
      // return {
      //   campaign: {
      //     relation: BaseModel.BelongsToOneRelation,
      //     modelClass: db.Campaign,
      //     join: {
      //       from: 'dtl.referral_codes.campaign_id',
      //       to: 'dtl.campaigns.id'
      //     }
      //   }
      // }
    }

  }

  return PublisherTotal
}
