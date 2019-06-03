require('../test_helper')

describe('Platform', async function () {
  context('properties', async function () {
    let platformAttrs, platform
    beforeEach(async function () {
      platformAttrs = await factory.attrs('platform', {platform: 'BeOS'})
      platform = await db.Platform.query().insert(platformAttrs)
    })
    specify('platform', async function () {
      expect(platform).to.have.property('platform', platformAttrs.platform)
    })
    specify('label', async function () {
      expect(platform).to.have.property('label', platformAttrs.label)
    })
    specify('description', async function () {
      expect(platform).to.have.property('label', platformAttrs.description)
    })
  })
})
