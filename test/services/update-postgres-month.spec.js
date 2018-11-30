const _ = require('underscore')
const moment = require('moment')
require('../test_helper')
const MonthUpdate = require('../../src/services/update-postgres-month.service')
const { Util } = require('../../src/models/util')
const { ReferralCode } = require('../../src/models/referral_code')
const CoreUsage = require('../../src/models/core-usage.model')()

describe('update-postres-month', async function () {
  describe('main', async function () {
    it('works on the brave core usages', async function () {
      // setup
      const service = new MonthUpdate()
      const core_usage = await factory.build('core_winx64_usage')
      await core_usage.save()
      await service.main('brave_core_usage', moment().subtract(3, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
      const usage_months = await knex('dw.fc_usage_month').select('*')
      expect(usage_months).to.have.property('length', 1)
      expect(usage_months[0]).to.have.property('platform', 'winx64-bc')
      expect(moment(usage_months[0].ymd).format('YYYY-MM-DD')).to.equal(core_usage.year_month_day)
    })
    it('correctly updates fc_usage_month', async function(){
      this.timeout(30000)
      const service = new MonthUpdate()
      const brave_core_usages = require('../fixtures/brave_core_usage')
      await CoreUsage.insertMany(brave_core_usages)
      await service.main('brave_core_usage', moment().subtract(3, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
    })
    it('updates the ReferralCodes', async function(){ 
      const service = new MonthUpdate()
      const core_usage = await factory.build('core_winx64_usage')
      await core_usage.save()
      await service.main('brave_core_usage', moment().subtract(3, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
      const refs = (await ReferralCode.find({})).map(r => r.code_text)
      const usage_refs = (await knex('dw.fc_usage_month').select('*')).map(r => r.ref )
      expect(usage_refs.length).to.be.greaterThan(0)
      for(let ref of usage_refs){
        expect(refs).to.include(ref)
      }
      expect(_.difference(refs, usage_refs)).to.have.property('length', 0)
    })
  })
  describe('#importExceptions', async function(){
    it('overwrites the values of existing, bad rows', async function(){
      const first = await factory.build('fc_usage_month', { platform: 'ios'})
      await first.save()
      const replace = await factory.build('fc_usage_month', { platform: 'androidbrowser'})
      await replace.save()
      const exception = await factory.build('fc_usage_month_exception', { total : Util.random_int(10000), platform: 'androidbrowser'})
      await exception.save()

      const service = new MonthUpdate()
      await service.importExceptions()
      const updatedMonths = await knex('dw.fc_usage_month').select('*').orderBy('created_at')
      expect(updatedMonths[0].total).to.equal(first.total)
      expect(updatedMonths[0]).to.have.property('platform', 'ios')
      expect(updatedMonths[1].updated_at).to.not.equal(replace.updated_at)
      expect(updatedMonths[1]).to.have.property('total', exception.total)
      expect(updatedMonths[1]).to.have.property('platform', 'androidbrowser')


    })
  })
})
