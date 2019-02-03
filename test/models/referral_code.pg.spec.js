require('../test_helper')
const _ = require('lodash')

describe('ReferralCode model', async function () {
  context('properties', async function () {
    specify('campaign_id', async function () {
      const new_ref_code = new db.ReferralCode({code_text: 'ABC123', campaign_id: 3})
      await new_ref_code.save()
      const c = await db.ReferralCode.where('id', 1).fetch()
      expect(c.get('campaign_id')).to.equal(3)
    })
    specify('code_text', async function () {
      const new_ref_code = new db.ReferralCode({code_text: 'ABC123'})
      await new_ref_code.save()
      const c = await db.ReferralCode.where('id', 1).fetch()
      expect(c.get('code_text')).to.equal('ABC123')
    })
    it('requires code_text to be made of numbers and capital letters', async function () {
      const check_validation = async function (code_text, message) {
        let thrown = false
        try {
          const ref_code = new db.ReferralCode({code_text: code_text})
          await ref_code.save()
        } catch (e) {
          thrown = true
          expect(e.message).to.include(message)
        }
        expect(thrown).to.equal(true, `ReferralCode should throw an error on save when given code_text of ${code_text}`)
      }
      const bad_codes = ['abc123', '$123A6', 'Bart B', 'ABC']
      for (let bad_code of bad_codes) {
        await check_validation(bad_code, 'code_text may only consist of numbers and upper-case roman letters and be six characters long')
      }
    })
    it('has timestamps', async function () {
      const new_ref_code = new db.ReferralCode({code_text: '123456'})
      await new_ref_code.save()
      const c = await db.ReferralCode.where('id', 1).fetch()
      expect(c.get('created_at')).to.be.a('date')
      expect(c.get('updated_at')).to.be.a('date')
    })
  })
})
