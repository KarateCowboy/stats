const common = require('./common')
const moment = require('moment')
const _ = require('underscore')

exports.setup = (server, client, mongo) => {

  // Daily retention (DAU and DNU)
  server.route({
    method: 'GET',
    path: '/api/1/daily_retention',
    handler: async (request, h) => {
      try {
        let [days, platforms, channels, ref, wois, countryCodes] = common.retrieveCommonParameters(request)

        if (!ref) return []

        const databaseParams = {
          common: true,
          daysAgo: parseInt(days.replace(' days', '')),
          platforms: platforms,
          channels: channels,
          ref: ref,
          wois: wois,
          countryCodes: countryCodes
        }

        // retrieve the data
        let [dau, dnu, dauByCountry] = await Promise.all([
          db.UsageSummary.dauCampaignAgg(databaseParams),
          db.UsageSummary.dnuCampaignAgg(databaseParams),
          db.UsageSummary.dauByCountry(databaseParams)
        ])

        dau.rows.forEach((row) => common.formatPGRow(row))
        dau.rows = common.potentiallyFilterToday(dau.rows, request.query.showToday === 'true')

        dnu.rows.forEach((row) => common.formatPGRow(row))
        dnu.rows = common.potentiallyFilterToday(dnu.rows, request.query.showToday === 'true')

        dauByCountry.rows.forEach((row) => common.formatPGRow(row))
        dauByCountry.rows = common.potentiallyFilterToday(dauByCountry.rows, request.query.showToday === 'true')

        if (wois) {
          const firstWOI = wois.sort()[0]
          dnu.rows = dnu.rows.filter((row) => {
            return row.ymd > moment(firstWOI).subtract(5, 'days').format('YYYY-MM-DD')
          })
          dau.rows = dau.rows.filter((row) => {
            return row.ymd > moment(firstWOI).subtract(5, 'days').format('YYYY-MM-DD')
          })
        }

        const dauGroupedByCampaign = _.groupBy(dau.rows, (row) => { return row.campaign })
        const dnuGroupedByCampaign = _.groupBy(dnu.rows, (row) => { return row.campaign })
        const dauByCountryGroupedByCampaign = _.groupBy(dauByCountry.rows, (row) => { return row.campaign })

        const campaignSummary = (campaign, dau, dnu) => {
          let s = 0
          dnu.forEach((row) => {
            s += row.count
          })

          let dnuSum = 0
          let combined = dau.reverse().map((dau) => {
            let ymd = dau.ymd
            let dauTotal = dau.count
            let dnuTotal = 0
            let dnuRow = dnu.find((row) => { return row.ymd === dau.ymd })
            if (dnuRow) dnuTotal = dnuRow.count

            let retained = 0
            if (dnuSum > (s * 0.0001)) {
              retained = (dauTotal - dnuTotal) / dnuSum
              retained = Math.round(retained * 10000) / 10000
            }
            dnuSum += dnuTotal

            return {
              ymd,
              campaign,
              dau: dauTotal,
              dnu: dnuTotal,
              dru: dauTotal - dnuTotal,
              dnuSum,
              dauByCountry: dauByCountryGroupedByCampaign[campaign].filter((r) => {
               return r.ymd === ymd
              }),
              retained
            }
          })

          return combined
        }

        const completeResults = _.keys(dauGroupedByCampaign).map((campaign) => {
          return campaignSummary(
            campaign,
            dauGroupedByCampaign[campaign],
            dnuGroupedByCampaign[campaign]
          )
        })

        return (completeResults)
      } catch (e) {
        console.log(e.toString())
        console.trace(e)
        return {}
      }
    }
  })
}
