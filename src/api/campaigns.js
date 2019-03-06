const _ = require('lodash')

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/campaigns',
    handler: async function (request, h) {
      const campaigns = await db.Campaign.query().orderBy('name').eager('referralCodes')
      return campaigns
    }
  })
}
