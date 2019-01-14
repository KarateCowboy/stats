const _ = require('lodash')
const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const moment = require('moment')
const ChannelTotal = require('../../../../src/models/channel_total.model')()
const PublisherTotal = require('../../../../src/models/publisher_total.model')()

Then(/^I should see the publishers table with row headings and data$/, async function () {
  let exists = await browser.isVisible('#publishers_overview')
  expect(exists).to.equal(true, 'publishers_overview widget should be visible on the overview page')
  await browser.pause(300)
  exists = await browser.isVisible('#publishers_overview #publishers_table')
  const publisher_table_rows = await browser.getHTML('#publishers_table tr ')
  let row_headings = ['Verified', 'With a channel', 'With a verified channel', 'With Uphold']
  for (let heading of row_headings) {
    expect(publisher_table_rows.toString()).to.contain(heading, `Publishers table should contain a row with heading ${heading}`)
  }
  expect(exists).to.equal(true, 'publishers_overview widget should contain a table for the publisher information')
  //check actual data in rows
  const publisher_total = _.first(await PublisherTotal.find().sort({ createdAt: -1 }).limit(1))
  expect(publisher_table_rows[0]).to.contain(publisher_total.email_verified)
  expect(publisher_table_rows[1]).to.contain(publisher_total.email_verified_with_a_channel)
  expect(publisher_table_rows[2]).to.contain(publisher_total.email_verified_with_a_verified_channel)
  expect(publisher_table_rows[3]).to.contain(publisher_total.email_verified_with_a_verified_channel_and_uphold_verified)

})
Then(/^I should see the channels table with column headings and data$/, async function () {
  let exists = await browser.isVisible('#publishers_overview #channels_table')
  expect(exists).to.equal(true)

  let channels_heading = await browser.getHTML('#channels_table thead')
  const channel_tds = await browser.getHTML('#channels_table > tbody > tr > td')

  expect(channel_tds).to.have.property('length', 4)
  const channels_headings = [
    'All',
    'youtube.svg',
    'internet.svg',
    'twitch.svg'
  ]
  const latest_totals = _.first(await ChannelTotal.find({}).sort({createdAt: -1, $limit: 1}))

  for (let heading of channels_headings) {
    expect(channels_heading).to.contain(heading)
  }
  expect(channel_tds[0]).to.contain(latest_totals.all_channels)
  expect(channel_tds[1]).to.contain(latest_totals.youtube)
  expect(channel_tds[2]).to.contain(latest_totals.site)
  expect(channel_tds[3]).to.contain(latest_totals.twitch)
})

Given(/^there is recent data for publisher totals$/, async function () {
  const working_day = moment().subtract(5, 'days')
  while (working_day.isSameOrBefore(moment())) {
    const day = working_day.toDate()
    await factory.create('channel_total', {
      createdAt: day,
      updatedAt: day
    })
    await factory.create('publisher_total', {
      createdAt: day,
      updatedAt: day
    })
    working_day.add(1, 'days')
  }
})

