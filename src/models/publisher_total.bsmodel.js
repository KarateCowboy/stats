/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Schema = require('./validators/publisher_totals')
const Joi = require('joi')
const _ = require('lodash')
const moment = require('moment')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class PublisherTotal extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dw.publisher_totals'
    }

    formattedYmd () {
      return moment(this.ymd).format('YYYY-MM-DD')
    }

    asYmd () {
      return [
        {
          ymd: this.formattedYmd(),
          count: this.email_verified_with_a_verified_channel_and_uphold_verified,
          verificationStatus: 'E-mail, channel, and uphold all verified'
        },
        {
          ymd: this.formattedYmd(),
          count: this.email_verified_with_a_verified_channel,
          verificationStatus: 'Verified e-mail with verified channel'
        },
        {
          ymd: this.formattedYmd(),
          count: this.email_verified_with_a_channel,
          verificationStatus: 'Verified e-mail with channel'
        },
        {
          ymd: this.formattedYmd(),
          count: this.email_verified,
          verificationStatus: 'E-mail only'
        }
      ]
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
