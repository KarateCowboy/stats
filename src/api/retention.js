const remote = require('../remote-job')

exports.setup = async (server, client, mongo, ch) => {
  server.route({
    method: 'GET',
    path: '/api/1/retention_cc',
    handler: remote.jobHandler(client, ch, 'country-retention')
  })

  server.route({
    method: 'GET',
    path: '/api/1/retention_week',
    handler: remote.jobHandler(client, ch, 'weekly-retention')
  })
}
