
    handler: async function (request, h) {
      var [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await db.UsageSummary.dailyActiveUsers({
        daysAgo: parseInt(days.replace(' days', '')),
        platforms: platforms,
        channels: channels,
        ref: ref
      })
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      return (results.rows)
    }
