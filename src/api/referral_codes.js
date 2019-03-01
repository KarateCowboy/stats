const _ = require('lodash')
const ReferralCode = require('../models/referral-code.model')()

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/referral_codes',
    handler: async function (request, h) {
      const ref_codes = await db.ReferralCode.query()
      return (_.sortBy(ref_codes, 'code_text'))
    }
  })
}
