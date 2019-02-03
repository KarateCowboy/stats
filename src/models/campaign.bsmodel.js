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

    get tableName () {
      return 'dtl.campaigns'
    }

    async getReferralCodes () {
      const referralCodes = db.ReferralCode.where('campaign_id', this.attributes.id).fetchAll()
      return referralCodes
    }

    static async allWithReferralCodes () {
      const campaigns = await this.fetchAll()
      await Promise.all(campaigns.map(async (c) => {
        const codes = await c.getReferralCodes()
        c.attributes.referralCodes = codes.models.map(m => m.toJSON())
      }))
      return campaigns
    }

  }

  return Campaign

}
