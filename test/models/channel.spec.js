const _ = require('lodash')
const moment = require('moment')
const Util = require('../../src/models/util').Util
require('../test_helper')

describe('Channel', async function () {
  context('properties', async function () {
    let channelAttrs, channel
    beforeEach(async function () {
      channelAttrs = await factory.attrs('channel', {channel: 'funimation'})
      channel = await db.Channel.query().insert(channelAttrs)
    })
    specify('channel', async function () {
      expect(channel).to.have.property('channel', channelAttrs.channel)
    })
    specify('label', async function () {
      expect(channel).to.have.property('label', channelAttrs.label)
    })
    specify('description', async function () {
      expect(channel).to.have.property('description', channelAttrs.description)
    })
  })

})
