require('../test_helper')
const {expect} = require('chai')
const ReferralCode = require('../../src/models/referral-code.model')()
_ = require('underscore')

describe('ReferralCode', async function () {
  describe('properties', async function () {
    specify('requires code as a string, six or more characters', async function () {
      await test_helper.truncate()
      let sample_code = new ReferralCode({platform: 'winx64'})
      let thrown = false
      try {
        await sample_code.save()
      } catch (e) {
        thrown = true
        expect(e.message).to.include('Path `code_text`')
      }
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
  describe('add_missing', async function () {
    it('adds missing referral codes', async function () {
      const new_codes = ['ABC123','123ABC','A1B2C3']
      await ReferralCode.add_missing(new_codes, 'ios')
      const codes = await ReferralCode.find()
      expect(codes.map(u => u.code_text)).to.have.members(new_codes)
    })
    it('does not overwrite existing referral codes', async function(){
      const new_codes = ['ABC123','123ABC']
      await ReferralCode.create({ code_text: 'ABC123', platform: 'ios'})
      await mongo_client.collection('referral_codes').updateMany({ }, { $unset: { updatedAt: 1 }})
      await ReferralCode.add_missing(new_codes, 'ios')
      const codes = await ReferralCode.find()
      expect(codes).to.have.property('length',2)
      expect(_.find(codes, {code_text: 'ABC123'}).updatedAt).to.equal(undefined)
    })
    it('does not save codes which are invalid', async function(){
      const new_codes = ['ABC123','123', 'abc123', 'ABC12345']
      await ReferralCode.add_missing(new_codes, 'ios')
      const codes = await ReferralCode.find()
      expect(codes).to.have.property('length',1)
      expect(_.first(codes)).to.have.property('code_text', 'ABC123')
    })
  })
})
