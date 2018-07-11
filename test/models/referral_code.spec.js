const {TestHelper} = require('../test_helper')
const {expect} = require('chai')
const {ReferralCode} = require('../../src/models/mongoose/referral_code')

let test_helper
before(async function () {
  test_helper = new TestHelper()
  await test_helper.setup()
})
after(async function () {
  await test_helper.tear_down()
})

describe('ReferralCode', async function () {
  describe('properties', async function () {
    specify('requires code as a string, six or more characters', async function () {
      await test_helper.truncate()
      let sample_code = new ReferralCode({platform: 'winx64'})
      let thrown = false
      try { await sample_code.save() } catch (e) { thrown = true }
      expect(thrown).to.equal(true)

      sample_code = new ReferralCode({code_text: 123456, platform: 'winx64'})
      await sample_code.save()
      expect(sample_code.code_text).to.be.a('string')

      sample_code = new ReferralCode({code_text: '123', platform: 'winx64'})
      thrown = false
      try { await sample_code.save() } catch (e) { thrown = true }
      expect(thrown).to.equal(true)
    })
    specify('an array of usages, having objectids as members', async function () {
      let sample_code = new ReferralCode({code: '123ABC'})
      expect(sample_code.usages).to.be.an('array')
    })
    specify('a platform attribute, so we know where to look for usages', async function () {
      let sample_code = new ReferralCode({code: '123456'})
      let thrown = false
      try { await sample_code.save() } catch (e) { thrown = true }
      expect(thrown).to.equal(true)
    })
  })
})