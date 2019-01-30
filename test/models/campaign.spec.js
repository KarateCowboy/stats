require('../test_helper')
const _ = require('lodash')
describe('Campaign model', async function () {
  it('exists and connects to the database', async function () {
    const new_campaign = new db.Campaign()
    await new_campaign.save()
    expect(new_campaign).to.have.property('id')
    expect(new_campaign.id).to.be.a('number')
  })
  context('properties', async function () {
    it('has a name', async function () {
      const new_campaign = new db.Campaign({name: 'James Promo'})
      await new_campaign.save()
      const c = await db.Campaign.findById(1)
      expect(c.get('name')).to.equal('James Promo')
    })
    it('requires the name to be at least four characters long', async function () {
      let thrown = false
      try {
        await db.Campaign.create({name: '1'})
      } catch (e) {
        thrown = true
        expect(e.message).to.include('name must be at least four(4) characters long')
      }
      expect(thrown).to.equal(true, 'Campaign should throw an error on save')
    })
    it('has timestamps', async function () {
      const new_campaign = new db.Campaign({name: 'James promo'})
      await new_campaign.save()
      const c = await db.Campaign.findByPk(1)
      expect(c).to.have.property('created_at')
      expect(c.created_at).to.be.a('date')
      expect(c).to.have.property('updated_at')
      expect(c.updated_at).to.be.a('date')
    })
  })
  context('associations', async function () {
    it('has many ReferralCodes', async function () {
      const campaign = new db.Campaign((await factory.attrs('campaign')))
      await campaign.save()
      const referral_codes = await factory.createMany('ref_code_pg', 3, {campaign_id: campaign.id})
      const fetched_ref_codes = await campaign.getReferralCodes()
      expect(fetched_ref_codes.map(c => c.code_text)).to.have.members(referral_codes.map(c => c.code_text))
    })
  })
})
