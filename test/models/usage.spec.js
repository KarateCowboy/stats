require('../test_helper')

describe('Usage', async function () {
  it('has a collection_name', async function () {
    await test_helper.truncate()
    let usage = await factory.build('android_usage')
    await usage.save()
    usage.ref = 'MATTHEW'
    let bulk = mongo_client.collection('android_usage').initializeOrderedBulkOp()
    bulk.find(usage).updateOne({$set: {ref: usage.ref}})
    await bulk.execute()
    const written = await mongo_client.collection('android_usage').find({}).toArray()
    expect(written).to.have.property('length', 1)
  })
})
