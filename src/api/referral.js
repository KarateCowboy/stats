const common = require('./common')
const URL = require('url').URL
const _ = require('lodash')

const proxyHosts = {
  PROMO_SERVICES: {
    url: process.env.PROMO_SERVICES_URL,
    token: process.env.PROMO_SERVICES_TOKEN
  }
}

// method, local uri, remote uri, description, service
const proxyForwards = [
  ['GET', '/api/1/referral/stats/summary', '/api/1/promo/stats/summary', 'Retrieve referral promo summary stats', 'PROMO_SERVICES'],
  ['GET', '/api/1/referral/stats/hourly', '/api/1/promo/stats/hourly', 'Retrieve hourly referral promo summary stats', 'PROMO_SERVICES']
]
const buildProxyRouteWithAuthorizationInsertion = (line) => {
  return {
    method: line[0],
    path: line[1],
    handler: async (request, h) => {
      let url = proxyHosts[line[4]].url
      let token = proxyHosts[line[4]].token
      try {
        const originalUrl = 'https'
          + '://'
          + request.info.host
          + request.path
        let urlObject = new URL(originalUrl)
        var options = {
          method: 'GET',
          url: url + line[2] + '?' + urlObject.searchParams.toString(),
          headers: {
            Authorization: 'Bearer ' + token
          }
        }
        let json = await common.prequest(options)
        let results
        try {
          results = JSON.parse(json)
        } catch (e) {
          console.log('Error: results could not be retrieved from ' + url)
          results = {}
        }
        return (results)
      } catch (e) {
        console.log(e)
        return (null)
      }
    }
  }
}

exports.setup = (server, db, mongo) => {
  proxyForwards.forEach((line) => {
    server.route(buildProxyRouteWithAuthorizationInsertion(line))
  })
}
