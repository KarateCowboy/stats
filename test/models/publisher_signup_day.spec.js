/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require('lodash')
require('../test_helper')
const moment = require('moment')
const sinon = require('sinon')
const common = require('../../src/api/common')

describe('PublisherSignupDay', async function () {
  describe('schema', async function () {
    let publisherSignupDay, publisherSignupDayAttrs
    beforeEach(async function () {
      publisherSignupDayAttrs = await factory.attrs('publisher_signup_day')
      await db.PublisherSignupDay.query().insert(publisherSignupDayAttrs)
      publisherSignupDay = (await db.PublisherSignupDay.query().limit(1))[0]
    })
    specify('email_channel_and_uphold_verified {type: Number},', async function () {
      expect(publisherSignupDay).to.have.property('email_channel_and_uphold_verified', publisherSignupDayAttrs.email_channel_and_uphold_verified)
    })
    specify('email_channel_verified youtube: {type: Number},', async function () {
      expect(publisherSignupDay).to.have.property('email_channel_verified', publisherSignupDayAttrs.email_channel_verified)
    })
    specify('email_verified : {type: Number},', async function () {
      expect(publisherSignupDay).to.have.property('email_verified', publisherSignupDayAttrs.email_verified)
    })
  })
  describe('#dailyTotalAgg', async function () {
    it('returns the total up to that day', async function () {
      const attrs = _.range(1, 20).map((i) => { return {ymd: moment().subtract(i, 'days').format('YYYY-MM-DD')}})
      const publisherSignupDays = await factory.createMany('publisher_signup_day', attrs)
      const result = await db.PublisherSignupDay.dailyTotalAgg()
      const aggregatedTotals = []
      publisherSignupDays.reduce((acc, val) => {
        acc.email_verified += val.email_verified
        acc.email_channel_verified += val.email_channel_verified
        acc.email_channel_and_uphold_verified += val.email_channel_and_uphold_verified
        acc.ymd = val.ymd
        aggregatedTotals.push(_.clone(acc))
        return acc
      }, {email_verified: 0, email_channel_verified: 0, email_channel_and_uphold_verified: 0})
      expect(true).to.equal(true)
      expect(result.map(i => i.email_verified)).to.have.members(aggregatedTotals.map((i) => {return i.email_verified}))
      expect(result.map(i => i.email_channel_verified)).to.have.members(aggregatedTotals.map(i => i.email_channel_verified))
      expect(result.map(i => i.email_channel_and_uphold_verified)).to.have.members(aggregatedTotals.map(i => i.email_channel_and_uphold_verified))
    })
  })
  describe('#asYmd', async function () {
    specify('returns an array with ymd, verificationStatus, and count', async function () {
      publisherSignupDayAttrs = await factory.attrs('publisher_signup_day')
      await db.PublisherSignupDay.query().insert(publisherSignupDayAttrs)
      let publisherSignupDay = (await db.PublisherSignupDay.query().limit(1))[0]
      const asYmd = publisherSignupDay.asYmd()
      expect(asYmd[0].ymd.toString()).to.equal(moment(publisherSignupDay.ymd).format('YYYY-MM-DD'))
      expect(asYmd[0]).to.have.property('count')
      expect(asYmd[0]).to.have.property('verificationStatus')

      const verificationStatuses = asYmd.map(i => i.verificationStatus)
      expect(verificationStatuses).to.have.members([
        'E-mail, channel, and basic uphold identity verified',
        'Verified e-mail with verified channel',
        'Verified e-mail'
      ])

    })
  })
  describe('buildFromRemote', async function () {
    let channelUpholdEmailVerifiedUrl, channelEmailVerifiedUrl, emailVerifiedUrl
    let channelUpholdEmailVerifiedExpectedResult, channelEmailVerifiedExpectedResult, emailVerifiedExpectedResult
    let threeDaysAgo
    beforeEach(async function () {
      channelUpholdEmailVerifiedUrl = 'https://publishers.basicattentiontoken.org/api/v1/stats/publishers/channel_uphold_and_email_verified_signups_per_day'
      channelEmailVerifiedUrl = 'https://publishers.basicattentiontoken.org/api/v1/stats/publishers/channel_and_email_verified_signups_per_day'
      emailVerifiedUrl = 'https://publishers.basicattentiontoken.org/api/v1/stats/publishers/email_verified_signups_per_day'
      let apiResponseBody = _.range(0, 100)
        .map((i) => {
          return [moment()
            .subtract(i, 'days')
            .format('YYYY-MM-DD'), _.random(100, 2000)]
        })
      const channelUpholdEmailVerifiedArgs = {
        method: 'GET',
        url: channelUpholdEmailVerifiedUrl,
        headers: {
          Authorization: `Token token=${process.env.PUBLISHERS_TOKEN}`
        }
      }
      threeDaysAgo = moment().subtract(3, 'days').format('YYYY-MM-DD')
      channelUpholdEmailVerifiedExpectedResult = apiResponseBody.find((i) => { return i[0] === threeDaysAgo})
      const channelEmailVerifiedArgs = {
        method: 'GET',
        url: channelEmailVerifiedUrl,
        headers: {
          Authorization: `Token token=${process.env.PUBLISHERS_TOKEN}`
        }

      }
      sinon.stub(common, 'prequest')
        .withArgs(channelUpholdEmailVerifiedArgs)
        .returns(JSON.stringify(apiResponseBody))

      apiResponseBody = _.range(0, 100)
        .map((i) => {
          return [moment()
            .subtract(i, 'days')
            .format('YYYY-MM-DD'), _.random(100, 2000)]
        })
      common.prequest
        .withArgs(channelEmailVerifiedArgs)
        .returns(JSON.stringify(apiResponseBody))
      channelEmailVerifiedExpectedResult = apiResponseBody.find((i) => { return i[0] === threeDaysAgo})
      const emailVerifiedArgs = {
        method: 'GET',
        url: emailVerifiedUrl,
        headers: {
          Authorization: `Token token=${process.env.PUBLISHERS_TOKEN}`
        }
      }

      apiResponseBody = _.range(0, 100)
        .map((i) => {
          return [moment()
            .subtract(i, 'days')
            .format('YYYY-MM-DD'), _.random(100, 2000)]
        })
      common.prequest
        .withArgs(emailVerifiedArgs)
        .returns(JSON.stringify(apiResponseBody))
      emailVerifiedExpectedResult = apiResponseBody.find((i) => { return i[0] === threeDaysAgo})
    })
    it('takes a ymd and populates `email_channel_and_uphold_verified` with endpoint data', async function () {
      const newSignupDay = await db.PublisherSignupDay
        .buildFromRemote(threeDaysAgo)
      expect(newSignupDay.email_channel_and_uphold_verified).to.equal(channelUpholdEmailVerifiedExpectedResult[1])
    })
    it('takes a ymd and populates `channel_and_email_verified`', async function () {
      const newSignupDay = await db.PublisherSignupDay
        .buildFromRemote(threeDaysAgo)
      expect(newSignupDay.email_channel_verified).to.equal(channelEmailVerifiedExpectedResult[1])

    })
    it('takes a ymd and populates `email_verified`', async function () {
      const newSignupDay = await db.PublisherSignupDay
        .buildFromRemote(threeDaysAgo)
      expect(newSignupDay.email_verified).to.equal(emailVerifiedExpectedResult[1])
    })
    it('adds the ymd', async function () {
      const newSignupDay = await db.PublisherSignupDay
        .buildFromRemote(threeDaysAgo)
      expect(newSignupDay.ymd).to.equal(threeDaysAgo)
    })
    it('takes an optional second date to specify a range, and returns an array', async function () {
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
      const newSignupDays = await db.PublisherSignupDay.buildFromRemote(threeDaysAgo, yesterday)
      expect(newSignupDays).to.be.an('array')
      expect(newSignupDays.map(i => i.ymd)).to.include(threeDaysAgo)
      expect(newSignupDays.map(i => i.ymd)).to.include(yesterday)
      expect(_.every(newSignupDays, (i) => { return i.email_verified > 0 })).to.equal(true)
      expect(_.every(newSignupDays, (i) => { return i.email_channel_verified > 0 })).to.equal(true)
      expect(_.every(newSignupDays, (i) => { return i.email_channel_and_uphold_verified > 0 })).to.equal(true)
    })
    afterEach(async function () {
      common.prequest.restore()
    })
  })
})
