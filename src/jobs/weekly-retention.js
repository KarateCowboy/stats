const remote = require('../remote-job')
const RetentionService = require('../services/retention.service')

module.exports = async (client, jobStatus) => {
  console.log(`${jobStatus.id}: weekly-retention - starting`)
  try {
    await remote.start(client, jobStatus.id)
    const results = await RetentionService.weeklyRetention(client, jobStatus.params)
    await remote.complete(client, jobStatus.id, results)
    console.log(`${jobStatus.id}: weekly-retention - complete`)
  } catch (e) {
    console.log(e)
    await remote.error(client, jobStatus.id, {
      error: e.toString()
    })
    console.log(`${jobStatus.id}: weekly-retention - error`)
  }
}
