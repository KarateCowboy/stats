/* global describe, beforeEach, db, factory, specify, knex, expect */
require('../test_helper')
const _ = require('lodash')

describe('recent_crash_report_details', async function () {
  it('presents empty channels as \'release\'', async function () {
    const releaseCrashes = await factory.buildMany('crash', 100)
    releaseCrashes.forEach(c => {
      c.contents.channel = null
      c.contents.ver = '72.00.12.11'
    })
    await db.Crash.query().insert(releaseCrashes)
    const results = await knex('dtl.crashes_bc').select()
    const channels = _.uniq(results.map(r => r.channel))
    expect(channels).to.have.members(['release'])
  })
})
