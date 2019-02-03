require('../test_helper')
const _ = require('lodash')
describe('Campaign model', async function () {
  context('properties', async function () {
    it('has a name', async function () {
      const new_campaign = new db.Campaign({name: 'James Promo'})
      await new_campaign.save()
      const c = await db.Campaign.where('id', 1).fetch()
      expect(c.get('name')).to.equal('James Promo')
    })
    it('requires the name to be at least four characters long', async function () {
      let thrown = false
      try {
        const new_campaign = new db.Campaign({name: '1'})
        await new_campaign.save()
      } catch (e) {
        thrown = true
        expect(e.message).to.include('name is required and must be at least four characters long')
      }
      expect(thrown).to.equal(true, 'Campaign should throw an error on save')
    })
    it('has timestamps', async function () {
      const new_campaign = new db.Campaign({name: 'James promo'})
      await new_campaign.save()
      const c = await db.Campaign.where('id', 1).fetch()
      expect(c.get('created_at')).to.be.a('date')
      expect(c.get('updated_at')).to.be.a('date')
    })
  })
  context('instance methods', async function () {
    describe('#getReferralCodes', async function () {
      it('returns the referal codes', async function () {
        const campaign = await factory.create('campaign')
        const referralCode = await factory.createMany('ref_code_pg', 3, {campaign_id: campaign.id})
        const fetchedCodes = await campaign.getReferralCodes()
        expect(fetchedCodes.models).to.not.equal(null)
        expect(fetchedCodes.models.length).to.equal(3)
        expect(_.first(fetchedCodes.models).get('campaign_id')).to.equal(campaign.id)
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
      expect(campaigns.models.map(c => c.id)).to.have.members([campaignOne.id, campaignTwo.id])
      //nested array of referralCodes
      expect(_.find(campaigns.models, {'id': 1}).attributes).to.have.property('referralCodes')
      //as objects `i.code_text` insures they are plain objects, not bookshelf objects
      expect(_.find(campaigns.models, {id: campaignOne.id}).attributes.referralCodes.map(i => i.code_text)).to.have.members(referralCodesOne.map(r => r.get('code_text')))
    })
  })
})
