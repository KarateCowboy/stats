/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('lodash')
require('../test_helper')

describe('PublisherTotal', async function () {
  describe('schema', async function () {
    let publisherTotal, publisherTotalAttrs
    beforeEach(async function () {
      publisherTotalAttrs = await factory.attrs('publisher_total')
      await db.PublisherTotal.query().insert(publisherTotalAttrs)
      publisherTotal = (await db.PublisherTotal.query().limit(1))[0]
    })
    specify('email_verified_with_a_verified_channel_and_uphold_verified {type: Number},', async function () {
      expect(publisherTotal).to.have.property('email_verified_with_a_verified_channel_and_uphold_verified', publisherTotalAttrs.email_verified_with_a_verified_channel_and_uphold_verified)
    })
    specify('email_verified_with_a_verified_channel youtube: {type: Number},', async function () {
      expect(publisherTotal).to.have.property('email_verified_with_a_verified_channel', publisherTotalAttrs.email_verified_with_a_verified_channel)
    })
    specify('email_verified_with_a_channel: {type: Number},', async function () {
      expect(publisherTotal).to.have.property('email_verified_with_a_channel', publisherTotalAttrs.email_verified_with_a_channel)
    })
    specify('email_verified : {type: Number},', async function () {
      expect(publisherTotal).to.have.property('email_verified', publisherTotalAttrs.email_verified)
    })
  })
  describe('#asYmd', async function () {
    specify('returns an array with ymd, verificationStatus, and count', async function () {
      publisherTotalAttrs = await factory.attrs('publisher_total')
      await db.PublisherTotal.query().insert(publisherTotalAttrs)
      let publisherTotal = (await db.PublisherTotal.query().limit(1))[0]
      const asYmd = publisherTotal.asYmd()
      expect(asYmd[0]).to.have.property('ymd', publisherTotal.ymd)
      expect(asYmd[0]).to.have.property('count')
      expect(asYmd[0]).to.have.property('verificationStatus')

      const verificationStatuses = asYmd.map(i => i.verificationStatus)
      expect(verificationStatuses).to.have.members(['E-mail only', 'Verified e-mail with channel', 'Verified e-mail with verified channel', 'E-mail, channel, and uphold all verified'])

    })
  })
})
