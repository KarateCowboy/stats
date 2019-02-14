const common = require('./common')

exports.setup = (server, client, mongo) => {

  // Daily retention (DAU and DNU)
  server.route({
    method: 'GET',
    path: '/api/1/daily_retention',
    handler: async (request, reply) => {
      var [days, platforms, channels, ref, wois] = common.retrieveCommonParameters(request)

      if (ref.length === 1 && ref[0] === '') return reply([])

      let dau = await db.UsageSummary.dailyActiveUsers({
        common: true,
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref,
        wois: wois
      })
      dau.rows.forEach((row) => common.formatPGRow(row))
      dau.rows = common.potentiallyFilterToday(dau.rows, request.query.showToday === 'true')

      let dnu = await db.UsageSummary.dailyNewUsers({
        common: true,
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref,
        wois: wois
      })
      dnu.rows.forEach((row) => common.formatPGRow(row))
      dnu.rows = common.potentiallyFilterToday(dnu.rows, request.query.showToday === 'true')

      let dnuSum = 0
      let combined = dau.rows.reverse().map((dau) => {
        let ymd = dau.ymd
        let dauTotal = dau.count
        let dnuTotal = 0
        let dnuRow = dnu.rows.find((row) => { return row.ymd === dau.ymd })
        if (dnuRow) dnuTotal = dnuRow.count
        let retained = (dauTotal - dnuTotal) / dnuSum
        retained = Math.round(retained * 10000) / 10000
        dnuSum += dnuTotal
        return {
          ymd,
          dau: dauTotal,
          dnu: dnuTotal,
          dnuSum,
          retained
        }
      })

      reply(combined)
    }
  })
}
