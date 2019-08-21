/* global describe, beforeEach, db, factory, specify, knex, expect */
require('../test_helper')

describe('dw.fc_crashes_dau_mv', async function () {
  describe('columns', async function () {
    let fetchedDau, usage, crash, release
    beforeEach(async function () {
      usage = await factory.build('linux-core-fcusage', { total: 10000 })
      usage.channel = 'release'
      await db.UsageSummary.query().insert(usage)

      release = await factory.build('release')
      release.brave_version = usage.version
      await db.Release.query().insert(release)

      crash = await factory.build('linux-crash')
      crash.contents.year_month_day = usage.ymd
      crash.contents.ver = release.chromium_version
      crash.contents.channel = usage.channel
      await db.Crash.query().insert(crash)

      await knex.raw('refresh materialized view dw.fc_crashes_dau_mv')
      fetchedDau = await knex('dw.fc_crashes_dau_mv').select()
      fetchedDau = fetchedDau[0]
    })
    specify('ymd', async function () {
      expect(fetchedDau.ymd).to.be.a('date')
    })
    specify('platform', async function () {
      expect(fetchedDau.platform).to.equal('linux-bc')
    })
    specify('usage', async function () {
      expect(fetchedDau.usage).to.equal('10000')
    })
    specify('crashes', async function () {
      expect(fetchedDau.crashes).to.equal('1')
    })
    specify('crash_ratio', async function () {
      expect(fetchedDau.crash_rate).to.contain('0.0001')
    })
    specify('channel', async function () {
      expect(fetchedDau).to.have.property('channel', usage.channel)
    })
    specify('maps empty or rull channel to \'release\' value', async function () {
      const emptyChannelCrash = await factory.build('linux-crash')
      emptyChannelCrash.contents.year_month_day = usage.ymd
      emptyChannelCrash.contents.ver = release.chromium_version
      emptyChannelCrash.contents.channel = ''

      const nullChannelCrash = await factory.build('linux-crash')
      nullChannelCrash.contents.year_month_day = usage.ymd
      nullChannelCrash.contents.ver = release.chromium_version
      nullChannelCrash.contents.channel = null
      await db.Crash.query().insert([nullChannelCrash, emptyChannelCrash])
      await knex.raw('refresh materialized view dw.fc_crashes_dau_mv')
      let fetchedDaus = await knex('dw.fc_crashes_dau_mv').select()
      expect(fetchedDaus).to.have.property('length', 1)
      expect(fetchedDaus[0]).to.have.property('crashes', '3')
    })
  })
})
