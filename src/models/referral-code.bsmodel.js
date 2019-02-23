/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Schema = require('./validators/referral_code')
const Joi = require('joi')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class ReferralCode extends BaseModel {

    get schema(){
      return Schema
    }
    static get tableName () {
      return 'dtl.referral_codes'
    }

    static randomCodeText(){
        let o = new ObjectID()
        return _.shuffle(o.toString()).join('').slice(0,6).toUpperCase() 
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
