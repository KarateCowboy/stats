(function () {
  var platformTitle = (platform) => {
    if (platform === 'android') return 'Android Browser'
    return platform
  }

  var platformIconImg = (platform) => {
    if (platform === 'android') platform = 'Android Browser'
    return `<img src="/local/img/platform-icons/${platform}.png" height="18">`
  }

  var sparklineOptions = {
    width: '200px',
    height: '55px',
    disableInteraction: true,
    fillColor: '#efefef',
    lineColor: '#999999'
  }

  let q = (v) => { return numeral(v).format('0,0') }

  var sortedChannels = []
  var results
  var totalDownloads

  var referralSummaryStatsRetriever = async () => {

    results = await $.ajax('/api/1/referral/stats/summary')

    console.log(results)
    totalDownloads = _.reduce(results.platform_summary, (memo, summary) => { return memo + summary.downloads }, 0)

    var summaryTable = $('#overview-referral-promo-summary')
    var ownerSummaryCount = results.owner_summary ? numeral(results.owner_summary.length).format('0,0') : '0'
    summaryTable.append(`<tr><td>Participating Publishers</td><td class='text-right'><strong>${ ownerSummaryCount }</strong></td></tr>`)
    summaryTable.append(`<tr><td>Total Downloads</td><td class='text-right'><strong>${numeral(totalDownloads).format('0,0')}</strong></td></tr>`)

    var platformTable = $('#overview-referral-promo-platform tbody')
    let sortedPlatforms = results.platform_summary.sort((a, b) => {
      return (b.downloads || 0) - (a.downloads || 0)
    })
    sortedPlatforms.forEach((summary) => {
      let finalizationPercentage = summary.downloads > 0 ? parseInt(summary.finalized / summary.downloads * 100) : 0
      let platformPercentage = parseInt(summary.downloads / totalDownloads * 100)
      platformTable.append(`
        <tr>
          <td>${platformIconImg(summary.platform)}</td>
          <td>${platformTitle(summary.platform)}</td>
          <td class='text-right'>${q(summary.downloads)} <span class='subvalue'>${platformPercentage}%</span></td>
          <td class='text-right'>${q(summary.finalized)} <span class='subvalue'>${finalizationPercentage}%</span><td>
        </tr>
      `)
    })
    platformTable.append(`
      <tr>
        <td></td>
        <td></td>
        <td class='text-right'><strong>${q(totalDownloads)}</strong></td>
        <td class='text-right'></td>
      </tr>
    `)

    let sparkData = _.pluck(results.ymd_summary, 'downloads')

    $('#overview-referral-promo-sparkline').sparkline(sparkData, sparklineOptions)

    sortedChannels = results.owner_summary.sort((a, b) => {
      return (b.downloads || 0) - (a.downloads || 0)
    })
    if (sortedChannels.length > 9) { sortedChannels = sortedChannels.slice(0, 10) }
    fillChannels()
  }

    var tbl = $('#overview-referral-promo-top-channels tbody')
  const fillChannels = () => {
    tbl.empty()
    sortedChannels.forEach((summary) => {
      let finalizationPercentage = summary.downloads > 0 ? parseInt(summary.finalized / summary.downloads * 100) : 0
      let channelPlatformPercentage = summary.downloads / totalDownloads * 100
      tbl.append(`<tr><td>${summary.title || summary.channel}</td><td>${platformIconImg(summary.platform)}</td><td>${platformTitle(summary.platform)}</td><td class='text-right'>${q(summary.downloads)} <span class="subvalue">${numeral(channelPlatformPercentage).format('0.0')}%</span></td><td class='text-right'>${q(summary.finalized)} <span class='subvalue'>${finalizationPercentage}%</span><td></tr>`)
    })
  }

  const searchForChannel = (text) => {
    sortedChannels = results.owner_summary.filter((c) => {
      return c.title.match(new RegExp(text, 'i'))
    })
    if (sortedChannels.length > 9) { sortedChannels = sortedChannels.slice(0, 10) }
    fillChannels()
  }

  const referralSearchHandler = (e) => {
    searchForChannel($(e.target).val())
  }

  $("#referral-search").on('input', _.debounce(referralSearchHandler, 250))

  $("#referral-download").on('click', async (evt) => {
    let ownerIds = _.chain(sortedChannels).pluck('owner_id').uniq().value()
    let ownerIdsQuery = ownerIds.map((o) => { return `owner_id=${o}` }).join('&')
    let hourlySummary = await $.ajax("/api/1/referral/stats/hourly?" + ownerIdsQuery)
    let buffer = 'OWNER,CHANNEL,TITLE,YMD,HOUR,PLATFORM,DOWNLOADED,FINALIZED\n'
    hourlySummary.forEach((row) => {
      buffer += `"${row.owner_id}","${row.channel}","${row.title}","${row.ymd}",${row.hour},"${row.platform}",${row.downloaded},${row.finalized}\n`
    })
    window.STATS.COMMON.downloadObjectAs(buffer, 'summary.csv', 'text/csv')
  })

  window.REFERRAL = {
    referralSummaryStatsRetriever
  }
})()
