require('./test_helper')
const _ = require('underscore')
const Retriever = require('../src/retriever')
describe('Various retriever methods', async function () {
  describe('#monthlyUsersByDay', async function () {
    context('ios collection', async function () {
      it('skips bad records where daily is false and monthly is true', async function () {
        const bad_usage = await factory.build('ios_usage', {
          daily: false,
          monthly: true
        })
        await bad_usage.save()
        const good_usage = await factory.build('ios_usage', {
          monthly: true,
          daily: true
        })
        await good_usage.save()
        const results = await Retriever.monthlyUsersByDay(global.mongo_client, 'ios_usage', bad_usage.year_month_day, bad_usage.year_month_day)
        expect(results).to.have.property('length', 1)
        expect(_.first(results)).to.have.property('count', 1)
      })
    })
    context('other collections', async function () {
      it('includes records where daily is false and monthly is true', async function () {
        const factories = [
          'android_usage',
          'winx64_usage',
          'core_winx64_usage'
        ]
        for (let usage_factory of factories) {
          const bad_usage = await factory.build(usage_factory, {
            daily: false,
            monthly: true,
            ref: 'none'
          })
          await bad_usage.save()
          const good_usage = await factory.build(usage_factory, {
            monthly: true,
            daily: true,
            ref: 'none'
          })
          await good_usage.save()
          const model = good_usage.constructor
          const collection_name = model.collection.name
          const results = await Retriever.monthlyUsersByDay(global.mongo_client, collection_name, bad_usage.year_month_day, bad_usage.year_month_day)
          expect(results).to.have.property('length', 1)
          expect(_.first(results)).to.have.property('count', 2)
        }
      })
    })
  })
})
