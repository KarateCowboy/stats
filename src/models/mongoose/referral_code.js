/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const ReferralCodeSchema = new mongoose.Schema({
  code_text: {type: Types.String, required: true, minlength: 5, unique: true},
  usages: {type: [], default: []},
  platform: {type: Types.String, required: true, minlength: 3}
}, {
  timestamps: true,
  collection: 'referral_codes'
})

ReferralCodeSchema.methods.sample_method = async function () {
}
const ReferralCode = mongoose.model('ReferralCode', ReferralCodeSchema)
module.exports.ReferralCodeSchema = ReferralCodeSchema

module.exports.ReferralCode = ReferralCode
