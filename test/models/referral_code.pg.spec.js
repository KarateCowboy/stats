require('../test_helper')
const _ = require('lodash')

describe('ReferralCode model', async function () {
  context('associations', async function () {

  })
  context('properties', async function () {
    specify('campaign_id', async function () {
      const new_ref_code = new db.ReferralCode({code_text: 'ABC123', campaign_id: 3})
      await new_ref_code.save()
      const c = await db.ReferralCode.findByPk(1)
      expect(c.campaign_id).to.equal(3)
    })
    specify('code_text', async function () {
      const new_ref_code = new db.ReferralCode({code_text: 'ABC123'})
      await new_ref_code.save()
      const c = await db.ReferralCode.findByPk(1)
      expect(c.code_text).to.equal('ABC123')
    })
    it('requires code_text to be made of numbers and capital letters', async function () {
      const check_validation = async function (code_text, message) {
        let thrown = false
        try {
          await db.ReferralCode.create({code_text: code_text})
        } catch (e) {
          thrown = true
          expect(e.message).to.include(message)

        }
        expect(thrown).to.equal(true, 'ReferralCode should throw an error on save')
      }
      const bad_codes = ['abc123', '$123A6', 'Bart B']
      for (let bad_code of bad_codes) {
        await check_validation(bad_code, 'code_text may only consist of numbers and upper-case roman letters')
      }
    })
    it('requires the code_text to be six characters long', async function () {
      let thrown = false
      try {
        await db.ReferralCode.create({code_text: '12345'})
      } catch (e) {
        thrown = true
        expect(e.message).to.include('code_text must be six(6) characters long')

      }
      expect(thrown).to.equal(true, 'ReferralCode should throw an error on save')
    })
    it('has timestamps', async function () {
      const new_ref_code = new db.ReferralCode({code_text: '123456'})
      await new_ref_code.save()
      const c = await db.ReferralCode.findByPk(1)
      expect(c).to.have.property('created_at')
      expect(c.created_at).to.be.a('date')
      expect(c).to.have.property('updated_at')
      expect(c.updated_at).to.be.a('date')
    })
  })
  context('associations', function () {
    it('belongs to a campaign', async function () {
      const campaign = await factory.create('campaign')
      await campaign.save()
      const new_ref_code = new db.ReferralCode({code_text: 'ABC123', campaign_id: campaign.id})
      await new_ref_code.save()
      const fectched_campaign = await new_ref_code.getCampaign()
      expect(fectched_campaign.name).to.equal(campaign.name, 'the campaign returned by association should match the one linked manually')
    })
  })

})
