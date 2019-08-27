const remote = require('../remote-job')
const _ = require('underscore')
const RetentionService = require('../services/retention.service')

module.exports = async (client, jobStatus) => {
  console.log(`${jobStatus.id}: country-retention - starting`)
  try {
    await remote.start(client, jobStatus.id)
    const results = await RetentionService.weeklyCountryRetention(client, jobStatus.params)
    await remote.complete(client, jobStatus.id, results)
    console.log(`${jobStatus.id}: country-retention - complete`)
  } catch (e) {
    await remote.error(client, jobStatus.id, {
      error: e.toString()
    })
    console.log(`${jobStatus.id}: country-retention - error`)
  }
}
