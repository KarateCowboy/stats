const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const ChannelTotal = require('../../../../src/models/channel_total.model')()

Given(/^there is recent ChannelTotal data$/, async function () {
  let channelTotal = await factory.create('channel_total')
})

Then(/^I should see the channel totals for all included channels$/, async function () {
  let channelTotal = await ChannelTotal.findOne()
  const channels = channelTotal.toObject()
  delete channels._id
  delete channels.createdAt
  delete channels.updatedAt
  delete channels.__v
  const ratio_of_channels = (n) => { return parseInt(channels[n] / channels.all_channels * 100) }
  for (let channel in channels) {
    const channelTh = `#channels_table > thead > tr > th.${channel}`
    await browser.waitForVisible(channelTh)
    let isVisible = await browser.isVisible(channelTh)
    expect(isVisible).to.equal(true, `Row for publisher channel ${channel} should be visible in Overview Channels widget`)
    const tdLocator = `#channels_table > tbody > tr >  td.${channel}`
    isVisible = await browser.isVisible(tdLocator)
    expect(isVisible).to.equal(true, `Icon for channel ${channel} should be visible in the Overview Channels table`)
    let tdText = await browser.getText(tdLocator)
    let expectedRatio = ratio_of_channels(channel)
    expect(tdText).to.contain(channels[channel].toLocaleString())
    if (channel !== 'all_channels') {
      expect(tdText).to.contain(expectedRatio)
    }
  }
})
