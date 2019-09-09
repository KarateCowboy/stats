const _ = require('underscore')

const remote = require('../remote-job')
const common = require('../api/common')

module.exports = async (client, jobStatus) => {
  console.log(`${jobStatus.id}: dau - starting`)
  try {
    await remote.start(client, jobStatus.id)
    const results = await db.UsageSummary.dailyActiveUsers({
      daysAgo: parseInt(jobStatus.params.days.replace(' days', '')),
      platforms: jobStatus.params.platforms,
      channels: jobStatus.params.channels,
      ref: jobStatus.params.ref
    })
    console.log(jobStatus)
    results.rows.forEach((row) => common.formatPGRow(row))
    results.rows = common.potentiallyFilterToday(results.rows, jobStatus.params.showToday)
    await remote.complete(client, jobStatus.id, JSON.stringify(results.rows))
    console.log(`${jobStatus.id}: dau - complete`)
  } catch (e) {
    await remote.error(client, jobStatus.id, {
      error: e.toString()
    })
    console.log(`${jobStatus.id}: dau - error`)
  }
}
