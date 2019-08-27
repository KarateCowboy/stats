const remote = require('../remote-job')

exports.setup = async (server, client, mongo, ch) => {
  server.route({
    method: 'GET',
    path: '/api/1/remote_jobs/{id}',
    handler: async (request, h) => {
      try {
        let jobStatus = await remote.retrieve(
          client,
          request.params.id
        )
        return jobStatus
      } catch (e) {
        console.log(e)
      }
    }
  })
}
