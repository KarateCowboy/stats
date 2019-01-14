/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('underscore')
require('../test_helper')
const ChannelTotal = require('../../src/models/channel_total.model')()

describe('ChannelTotal', async function () {
  describe('schema', async function () {
    specify(' twitch: {type: Number},', async function () {
      const channel_total = new ChannelTotal()
      await channel_total.save()
      expect(channel_total).to.have.property('twitch', 0 )
    })
    specify(' youtube: {type: Number},', async function () {
      const channel_total = new ChannelTotal()
      expect(channel_total).to.have.property('youtube', 0 )
    })
    specify(' site: {type: Number},', async function () {
      const channel_total = new ChannelTotal()
      expect(channel_total).to.have.property('site', 0 )
    })
    specify(' all_channels: {type: Number},', async function () {
      const channel_total = new ChannelTotal()
      expect(channel_total).to.have.property('all_channels', 0 )
    })
    specify('collection name is channel_totals', async function(){
      expect(ChannelTotal.collection.collectionName).to.equal('channel_totals')
    })
  })
})
