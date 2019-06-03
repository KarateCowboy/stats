require('../test_helper')
const _ = require('lodash')
describe('Campaign model', async function () {
  context('properties', async function () {
    it('has a name', async function () {
      const new_campaign = await db.Campaign.query().insert({name: 'James Promo'})
      const c = await db.Campaign.query().where('id', new_campaign.id)
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
      const c = await db.Campaign.query().where('id', new_campaign.id)
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
  context('static', async function () {
    context('properties', async function () {
      it('has a constant NO_CAMPAIGN_NAME', async function () {
        expect(db.Campaign).to.have.property('NO_CAMPAIGN_NAME', 'No Campaign')
      })
    })
    context('methods', async function () {
      describe('noCampaignCampaign', async function () {
        it('returns the NoCampaign campaign when it already exists', async function () {
          const noCampaignCampaign = await db.Campaign.query().insert({name: db.Campaign.NO_CAMPAIGN_NAME})
          const returnedCampaign = await db.Campaign.noCampaignCampaign()
          expect(returnedCampaign.id).to.equal(noCampaignCampaign.id)
        })
        it('creates and returns the NoCampaign campaign when it does not exist', async function(){
          const returnedCampaign = await db.Campaign.noCampaignCampaign()
          expect(returnedCampaign.id).to.be.a('number')
          expect(returnedCampaign).to.have.property('name', db.Campaign.NO_CAMPAIGN_NAME)
        })
      })
    })
  })
  describe('associations', async function(){
    specify('referralCodes', async function(){
      const campaign = await factory.create('campaign')
      const referralCodes = await factory.createMany('ref_code_pg', 3, {campaign_id: campaign.id})
      const fetchedCodes = await campaign.$relatedQuery('referralCodes')
      expect(fetchedCodes.map( c => c.code_text ).sort()).to.have.members(referralCodes.map( c => c.code_text ).sort())
    })
  })
})
