const DailyPublishers = require('../../src/ui/reports/daily-publishers')
const expect = require('chai').expect

describe('DailyPublishers', async function () {
  specify('basic attrs', async function () {
    const report = new DailyPublishers()
    expect(report).to.have.property('menuId', 'dailyPublishers')
    expect(report).to.have.property('title', 'Daily Publishers')
    expect(report).to.have.property('subtitle', '')
    expect(report).to.have.property('contentTagId', 'usageContent')
    expect(report).to.have.property('path', 'dailyPublishers')
    expect(report).to.have.property('menuTitle', 'Daily Publishers')
  })
})
