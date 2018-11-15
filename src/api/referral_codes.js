const {ReferralCode} = require('../models/referral_code')

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/referral_codes',
    handler: async function (request, reply) {
      const ref_codes = await ReferralCode.find({}).sort({code_text: 1}).lean()
      reply(ref_codes)
    }
  })
}
