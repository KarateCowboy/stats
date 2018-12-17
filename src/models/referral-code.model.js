/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('underscore')
const mongooseClient = require('mongoose')
const Types = mongooseClient.Schema.Types

module.exports = function () {
  const ReferralCode = new mongooseClient.Schema({
    code_text: {type: Types.String, required: true, minlength: 4, unique: true},
    usages: {type: [], default: []},
    platform: {type: Types.String, required: true, minlength: 3}
  }, {
    timestamps: true,
    collection: 'referral_codes'
  })

  ReferralCode.statics.add_missing = async function (codes, platform) {
    const all_codes = await mongo_client.collection('referral_codes').find({}).toArray()
    const already_existing = all_codes.map(u => u.code_text)
    const new_refs = _.difference(codes, already_existing)
    await Promise.all(new_refs.map(async (uref) => {
      let new_ref = new mongooseClient.models.ReferralCode({code_text: uref, platform: platform})
      if(new_ref.code_text.length >= 4) {
        await new_ref.save()
      }
    }))
  }
  if (mongooseClient.models.ReferralCode ) {
    return mongooseClient.models.ReferralCode
  } else {
    return mongooseClient.model('ReferralCode', ReferralCode)
  }
}

