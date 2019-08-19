const _ = require('underscore')
const Boom = require('@hapi/boom')

const common = require('./common')

const LOG_SQL = `
  SELECT
    TO_CHAR(wos, 'YYYY-MM-DD') AS wos,
    metric_value,
    SUM(total) AS count
  FROM dw.p3a_logs
  WHERE
    wos >= current_date - $8::interval AND
    platform = ANY ($1) AND
    channel = ANY ($2) AND
    metric_id = $3 AND
    country_code = ANY (COALESCE($4, ARRAY[country_code])) AND
    woi = ANY (COALESCE($5, ARRAY[woi])) AND
    version = ANY (COALESCE($6, ARRAY[version])) AND
    ref = ANY (COALESCE($7, ARRAY[ref]))
  GROUP BY
    wos,
    metric_value
  ORDER BY
    wos,
    metric_value
`

const metricNamesAndHashes = [
  [ 'Brave.P3A.SentAnswersCount', 'ad9df3418a14ecb5' ],
  [ 'Brave.Sync.Status', 'eae4a95b8c09a42d' ],
  [ 'DefaultBrowser.State', '33df1a44c15bcc95' ],
  [ 'Brave.Importer.ImporterSource', '87875a42a2a6a8f6' ],
  [ 'Brave.Shields.UsageStatus', '3cdac4ff03817abf' ],
  [ 'Brave.Core.TorEverUsed', '0204d8be905832eb' ],
  [ 'Brave.Core.LastTimeIncognitoUsed', 'b1058570f503f0ce' ],
  [ 'Brave.Core.NumberOfExtensions', '410178a8ced7551f' ],
  [ 'Brave.Core.BookmarksCountOnProfileLoad', 'ab69f03fcb9d9dee' ],
  [ 'Brave.Core.TabCount', '7d05063fe2a6c048' ],
  [ 'Brave.Core.WindowCount', '24d1b22c7eaa7a5c' ],
  [ 'Brave.Rewards.WalletBalance', 'ba2b3b341b25156e' ],
  [ 'Brave.Rewards.AutoContributionsState', '901c1684a458b7fa' ],
  [ 'Brave.Rewards.TipsState', '372d875540b1f8fb' ],
  [ 'Brave.Rewards.AdsState', '734e62a48a454797' ],
  [ 'Brave.Uptime.BrowserOpenMinutes', '5ba8d2713d6e6aba' ],
  [ 'Brave.Welcome.InteractionStatus', 'a75987059de6f8d7' ]
]

const setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/p3a',
    handler: async (request, h) => {
      try {
        const params = common.retrieveCommonP3AParameters(request)

        const rows = (await client.query(LOG_SQL, [
          params.platforms,
          params.channels,
          params.metricIds[0],
          params.countryCodes,
          params.wois,
          params.versions,
          params.ref,
          params.days
        ]
        )).rows.map((r) => {
          r.count = parseInt(r.count)
          return r
        })

        return rows
      } catch (e) {
        console.log(e)
        return Boom.badImplementation(e)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/metrics',
    handler: async (request, h) => {
      let metricIds = metricNamesAndHashes.map((tuple) => {
        return {
          label: tuple[0],
          id: tuple[1]
        }
      })
      if (request.query.q) {
        metricIds = metricIds.filter((mid) => {
          return mid.label.match(new RegExp(request.query.q))
        })
      }
      return [
        {
          id: 'browser',
          label: 'Browser',
          subitems: metricIds
        }
      ]
    }
  })
}

module.exports = {
  setup
}
