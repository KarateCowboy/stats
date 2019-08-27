const common = require('./common')
const moment = require('moment')
const _ = require('underscore')
const remote = require('../remote-job')

exports.setup = async (server, client, mongo, ch) => {
  server.route({
    method: 'GET',
    path: '/api/1/retention_cc',
    handler: async (request, h) => {
      try {
        let jobId = await remote.initialize(
          client,
          ch,
          'country-retention',
          common.retrieveCommonParametersObject(request)
        )
        return { id: jobId }
      } catch (e) {
        console.log(e)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/retention_week',
    handler: async (request, h) => {
      try {
        let jobId = await remote.initialize(
          client,
          ch,
          'weekly-retention',
          common.retrieveCommonParametersObject(request)
        )
        return { id: jobId }
      } catch (e) {
        console.log(e)
      }
    }
  })
}
