require('../test_helper')
const _ = require('lodash')

describe('ReferralCode model', async function () {
  context('properties', async function () {
    specify('campaign_id', async function () {
      const new_ref_code = await db.ReferralCode.query().insert({code_text: 'ABC123', campaign_id: 3})
      const c = await db.ReferralCode.query().where('id', 1)
      expect(c[0].campaign_id).to.equal(3)
    })
    specify('code_text', async function () {
      const new_ref_code = await db.ReferralCode.query().insert({code_text: 'ABC123'})
      const c = await db.ReferralCode.query().where('id', 1)
      expect(c[0].code_text).to.equal('ABC123')
    })
    it('requires code_text to be made of numbers and capital letters', async function () {
      const check_validation = async function (code_text, message) {
        let thrown = false
        try {
          const ref_code = await db.ReferralCode.query().insert({code_text: code_text})
        } catch (e) {
          thrown = true
          expect(e.message).to.include(message)
        }
        expect(thrown).to.equal(true, `ReferralCode should throw an error on save when given code_text of ${code_text}`)
      }
      const bad_codes = ['abc123', '$123A6', 'Bart B', 'ABC', 'ID_MM01_ALL_PAX_GR_ADR_010618_MAIA_Mobco_NonIncent__ID184WPAT1REGCODE_361_13']
      for (let bad_code of bad_codes) {
        await check_validation(bad_code, 'code_text may only consist of numbers and upper-case roman letters and be six characters long')
      }
    })
    it('but makes an exception for "none"', async function () {
      await db.ReferralCode.query().insert({code_text: 'none'})
    })
    it('has timestamps', async function () {
      const new_ref_code = await db.ReferralCode.query().insert({code_text: '123456'})
      const c = await db.ReferralCode.query().where('id', 1)
      expect(c[0].created_at).to.be.a('date')
      expect(c[0].updated_at).to.be.a('date')
    })
  })
})
