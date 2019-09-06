/* global factory, expect, knex, db, Scenario, Feature  */
Feature('Crash Reports')

Scenario('View a crash list from the Crash Ratios report', async (I) => {
  // setup
  const crashes = await factory.buildMany('win64-crash', 200)
  crashes.forEach((c) => { c.contents['channel'] = 'release' })
  await db.Crash.query().insert(crashes)

  const release = await factory.create('release', { chromium_version: crashes[0].contents['ver'] })
  const usageSummary = await factory.create('fc_usage', {
    ymd: crashes[0].contents.year_month_day,
    version: release.braveVersion,
    channel: 'release',
    platform: 'winx64-bc',
    total: crashes.length * 2
  })
  await usageSummary.$relatedQuery('release').relate(release)
  await release.$relatedQuery('crashes').relate(crashes)
  await knex.raw('refresh materialized view dw.fc_crashes_dau_mv')
  // execution
  I.amOnPage('/dashboard#crash_ratio')
  I.click('50', '#crash-ratio-table')

  // validation
  let currentUrl = await I.grabCurrentUrl()
  expect(currentUrl).to.contain('crash_ratio_list')
  I.wait(2)
  I.see('ID')
})
