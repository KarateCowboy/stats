require('../test_helper')
const _ = require('lodash')
describe('Campaign model', async function () {
  context('properties', async function () {
    it('has a name', async function () {
      const new_campaign = await db.Campaign.query().insert({name: 'James Promo'})
      const c = await db.Campaign.query().where('id', 1)
      expect(c[0].name).to.equal('James Promo')
    })
    it('requires the name', async function () {
      let thrown = false
      try {
        const new_campaign = await db.Campaign.query().insert({name: ''})
      } catch (e) {
        thrown = true
        expect(e.message).to.include('name is required')
      }
      expect(thrown).to.equal(true, 'Campaign should throw an error on save')
    })
    it('has timestamps', async function () {
      const new_campaign = await db.Campaign.query().insert({name: 'James promo'})
      const c = await db.Campaign.query().where('id', 1)
      expect(c[0].created_at).to.be.a('date')
      expect(c[0].updated_at).to.be.a('date')
    })
  })
  context('instance methods', async function () {
    describe('#getReferralCodes', async function () {
      it('returns the referal codes', async function () {
        const campaign = await factory.create('campaign')
        const referralCode = await factory.createMany('ref_code_pg', 3, {campaign_id: campaign.id})
        const fetchedCodes = await campaign.getReferralCodes()
        expect(fetchedCodes).to.not.equal(null)
        expect(fetchedCodes.length).to.equal(3)
        expect(_.first(fetchedCodes).campaign_id).to.equal(campaign.id)
      })
    })
  })

  describe('#allWithReferralCodes', async function () {
    it('returns all campaigns, with their referral codes as a nested array of Objects', async function () {
      const campaignOne = await factory.create('campaign')
      const referralCodesOne = await factory.createMany('ref_code_pg', 3, {campaign_id: campaignOne.id})
      const campaignTwo = await factory.create('campaign')
      const campaigns = await db.Campaign.allWithReferralCodes()
      _.noop()
      //returns all campaigns
      expect(campaigns.map(c => c.id)).to.have.members([campaignOne.id, campaignTwo.id])
      //nested array of referralCodes
      expect(_.find(campaigns, {'id': 1})).to.have.property('referralCodes')
      //as objects `i.code_text` insures they are plain objects, not bookshelf objects
      expect(_.find(campaigns, {id: campaignOne.id}).referralCodes.map(i => i.code_text)).to.have.members(referralCodesOne.map(r => r.code_text))
    })
  })
})
