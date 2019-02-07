/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')

Then(/^there is a campaign with referral code "([^"]*)"$/, async function (code_text) {
  const campaign = await factory.create('campaign')
  const referralCodes = await factory.create('ref_code_pg', {campaign_id: campaign.id, code_text: code_text})
})
