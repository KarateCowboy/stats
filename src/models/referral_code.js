/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('underscore')
const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const ReferralCodeSchema = new mongoose.Schema({
  code_text: {type: Types.String, required: true, minlength: 4, unique: true},
  usages: {type: [], default: []},
  platform: {type: Types.String, required: true, minlength: 3}
}, {
  timestamps: true,
  collection: 'referral_codes'
})

ReferralCodeSchema.statics.add_missing = async function (codes, platform) {
  const already_existing = (await this.find({ code_text: { $in: codes }})).map(u => u.code_text)
  const new_refs = _.difference(codes, already_existing)
  for (let uref of new_refs) {
    let newref = new ReferralCode({ code_text: uref, platform: platform })
    await newref.save()
  }
}
const ReferralCode = mongoose.model('ReferralCode', ReferralCodeSchema)
module.exports.ReferralCodeSchema = ReferralCodeSchema

module.exports.ReferralCode = ReferralCode
