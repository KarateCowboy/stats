/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Schema = require('./validators/referral_code')
const Joi = require('joi')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class ReferralCode extends BaseModel {

    get schema(){
      return Schema
    }
    static get tableName () {
      return 'dtl.referral_codes'
    }

    static get relationMappings () {
      return {
        campaign: {
          relation: BaseModel.BelongsToOneRelation,
          modelClass: db.Campaign,
          join: {
            from: 'dtl.referral_codes.campaign_id',
            to: 'dtl.campaigns.id'
          }
        }
      }
    }
  }

  return ReferralCode

}
