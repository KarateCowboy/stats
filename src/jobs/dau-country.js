const remote = require('../remote-job')
const _ = require('underscore')
const DailyService = require('../services/daily.service')

module.exports = async (client, jobStatus) => {
  console.log(`${jobStatus.id}: dau-country - starting`)
  try {
    await remote.start(client, jobStatus.id)
    const results = await DailyService.DAUCountry(client, jobStatus.params)
    await remote.complete(client, jobStatus.id, JSON.stringify(results))
    console.log(`${jobStatus.id}: dau-country - complete`)
  } catch (e) {
    await remote.error(client, jobStatus.id, {
      error: e.toString()
    })
    console.log(`${jobStatus.id}: dau-country - error`)
  }
}
