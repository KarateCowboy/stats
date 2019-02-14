/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Joi = require('joi')
const Schema = require('./validators/campaign')
module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Campaign extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dtl.campaigns'
    }

    async getReferralCodes () {
      return await db.ReferralCode.query().where('campaign_id', this.id)
    }

    static get NO_CAMPAIGN_NAME () {
      return 'No Campaign'
    }

    static async noCampaignCampaign () {
      const existingNoCampaignCampaign = (await this.query().where('name', this.NO_CAMPAIGN_NAME))[0]
      if (existingNoCampaignCampaign) {
        return existingNoCampaignCampaign
      } else {
        return this.query().insert({name: this.NO_CAMPAIGN_NAME})
      }
    }

    static get relationMappings (){
      return {
        referralCodes: {
          relation: BaseModel.HasManyRelation,
          modelClass: db.ReferralCode,
          join: {
            from: 'dtl.campaigns.id',
            to: 'dtl.referral_codes.campaign_id'
          }
        }
      }

    }

  }

  return Campaign

}
