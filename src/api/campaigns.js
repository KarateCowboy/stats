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

  server.route({
    method: 'GET',
    path: '/api/1/referrals_campaigns',
    handler: async (request, h) => {
      if (request.query.q && request.query.q.length < 2) return []

      let q = (request.query.q || null).toLowerCase()
      let campaigns = (await client.query("SELECT id, name as label, 0 as ord FROM dtl.campaigns ORDER BY name")).rows
      for (let campaign of campaigns) {
        campaign.subitems = (await client.query("SELECT code_text as id, code_text as label FROM dtl.referral_codes WHERE campaign_id = $1", [campaign.id])).rows
      }
      if (q) {
        let results = []
        for (let campaign of campaigns) {
          // if the campaign matches return the campaign and all subitems
          if (campaign.label.toLowerCase().match(q)) {
            results.push(campaign)
          } else {
            // if not remove all non-match subitems and remove the campaign if the subitem list is empty
            campaign.subitems = campaign.subitems.filter((subitem) => {
              return subitem.label.toLowerCase().match(q)
            })
            if (campaign.subitems.length > 0) results.push(campaign)
          }
        }
        campaigns = results
      }
      return campaigns
    }
  })
}
