const _ = require('lodash')

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/versions',
    handler: async function (request, h) {
      const versions = await db.Version.query().orderBy('num')
      return versions
    }
  })
}
