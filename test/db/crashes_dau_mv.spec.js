/* global describe, beforeEach, db, factory, specify, knex, expect */
require('../test_helper')

describe('dw.fc_crashes_dau_mv', async function () {
  describe('columns', async function () {
    let fetchedDau
    beforeEach(async function () {
      const usage = await factory.create('linux-core-fcusage', { total: 10000 })
      await db.UsageSummary.query().insert(usage)

      const release = await factory.build('release')
      release.brave_version = usage.version
      await db.Release.query().insert(release)

      const crash = await factory.build('linux-crash')
      crash.contents.year_month_day = usage.ymd
      crash.contents.ver = release.chromium_version
      await db.Crash.query().insert(crash)

      await knex.raw('refresh materialized view dw.fc_crashes_dau_mv')
      fetchedDau = (await knex('dw.fc_crashes_dau_mv').select())[0]
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
    specify('crash_ratio', async function() {
      expect(fetchedDau.crash_rate).to.contain('0.0001')
    })
  })
})
