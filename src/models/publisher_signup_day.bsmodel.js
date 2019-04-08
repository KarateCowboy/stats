/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Schema = require('./validators/publisher_signup_day')
const Joi = require('joi')
const _ = require('lodash')
const moment = require('moment')
const common = require('../api/common')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class PublisherSignupDay extends BaseModel {
    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dw.publisher_signup_days'
    }

    static async buildFromRemote (ymd) {
      let requestParams = {
        method: 'GET',
        url: '',
        headers: {
          Authorization: `Token token=${process.env.PUBLISHERS_TOKEN}`
        }
      }
      if (!process.env.LOCAL) {
        const ProxyAgent = require('proxy-agent')
        requestParams.agent = new ProxyAgent(process.env.FIXIE_URL)
      }
        requestParams.url = 'https://publishers.basicattentiontoken.org/api/v1/stats/publishers/channel_uphold_and_email_verified_signups_per_day'
        let channelUpholdVerified = await this.safeFetch(requestParams, ymd)
        requestParams.url = 'https://publishers.basicattentiontoken.org/api/v1/stats/publishers/channel_and_email_verified_signups_per_day'
        let channelEmailVerified = await this.safeFetch(requestParams, ymd)
        requestParams.url = 'https://publishers.basicattentiontoken.org/api/v1/stats/publishers/email_verified_signups_per_day'
        let emailVerified = await this.safeFetch(requestParams, ymd)
        return {
          email_channel_and_uphold_verified: channelUpholdVerified,
          email_channel_verified: channelEmailVerified,
          email_verified: emailVerified,
          ymd: ymd
        }

    }

    static async safeFetch(requestParams, ymd){
      let apiResponse
      try {
      apiResponse = await common.prequest(requestParams)
      apiResponse = JSON.parse(apiResponse)
      if(_.isEmpty(apiResponse)){
        return 0
      } else {
        let e = apiResponse.find((i) => { return i[0] === ymd })
        return e[1]
      }
      } catch (e) {
        console.log('Error trying to build PublisherSignupDay from remote API')
        console.log(e.message)
        console.dir(apiResponse)
      }
    }

    formattedYmd () {
      return moment(this.ymd).format('YYYY-MM-DD')
    }

    asYmd () {
      return [
        {
          ymd: this.formattedYmd(),
          count: this.email_channel_and_uphold_verified,
          verificationStatus: 'E-mail, channel, and basic uphold identity verified'
        },
        {
          ymd: this.formattedYmd(),
          count: this.email_channel_verified,
          verificationStatus: 'Verified e-mail with verified channel'
        },
        {
          ymd: this.formattedYmd(),
          count: this.email_verified,
          verificationStatus: 'Verified e-mail'
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

  return PublisherSignupDay
}
