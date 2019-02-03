const _ = require('lodash')

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/campaigns',
    handler: async function (request, reply) {
      const campaigns = await db.Campaign.allWithReferralCodes()
      reply(campaigns.models)
    }
  })
}
