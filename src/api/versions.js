const _ = require('lodash')

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/versions',
    handler: async function (request, h) {
      try {
        const versions = await db.Version.query().orderBy('num')
        return (versions)

      } catch (e) {
        console.log(e)
        return h.response(e.toString()).code(500)
      }
    }
  })
}
