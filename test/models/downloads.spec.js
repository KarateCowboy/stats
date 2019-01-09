require('../test_helper')

describe('Download model', async function(){
  it('exists and connects to the database', async function(){
    const new_download = new db.Download()
    await new_download.save()
    expect(new_download).to.have.property('id')
    expect(new_download.id).to.be.a('number')
  })
  context('properties', async function(){
    it('has a timestamp', async function(){
      const new_download = new db.Download()
      await new_download.save()
      expect(new_download).to.have.property('timestamp')
    })
  })
})
