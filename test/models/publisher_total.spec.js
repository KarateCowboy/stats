/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('lodash')
require('../test_helper')
const PublisherTotal = require('../../src/models/publisher_total.model')()

describe('PublisherTotal', async function () {
  describe('schema', async function () {
    specify('email_verified_with_a_verified_channel_and_uphold_verified {type: Number},', async function () {
      const publisher_total = new PublisherTotal()
      await publisher_total.save()
      expect(publisher_total).to.have.property('email_verified_with_a_verified_channel_and_uphold_verified', 0)
    })
    specify('email_verified_with_a_verified_channel youtube: {type: Number},', async function () {
      const publisher_total = new PublisherTotal()
      expect(publisher_total).to.have.property('email_verified_with_a_verified_channel', 0)
    })
    specify('email_verified_with_a_channel: {type: Number},', async function () {
      const publisher_total = new PublisherTotal()
      expect(publisher_total).to.have.property('email_verified_with_a_channel', 0)
    })
    specify('email_verified : {type: Number},', async function () {
      const publisher_total = new PublisherTotal()
      expect(publisher_total).to.have.property('email_verified', 0)
    })
  })
})
