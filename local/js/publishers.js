(function () {
  var currentlySelectedPlatform = 'publisher'

  var providerLogo = (provider) => {
    if (!provider) return ''
    var icon = {
      uphold: '/local/img/provider-icons/uphold.png'
    }[provider] || ''
    return icon
  }

  var publisherLabel = (publisher) => {
    if (publisher.platform === 'publisher') {
      return publisher.publisher
    } else {
      return publisher.name
    }
  }

  var overviewPublisherHandlerDetails = function (publishers, platform) {
    if (!publishers.length) return
    var i, publisher, createdWhen, details, grouped, selectedPublishers
    var buf = ''
    $('#details-publishers-table').fadeOut(250, () => {
      details = $('#details-publishers-table tbody')
      details.empty()
      grouped = _.groupBy(publishers, (publisher) => { return publisher.platform })
      selectedPublishers = grouped[platform]
      if (!selectedPublishers || !selectedPublishers.length) {
        $('#details-publishers-table').fadeIn(500)
        return
      }
      for (i = details.children().length; i < selectedPublishers.length; i++) {
        publisher = selectedPublishers[i]
        createdWhen = moment(publisher.created_at)
        buf += tr([
          td(`<img height=24 src="${providerLogo(publisher.provider)}"/>`, 'right'),
          td('<a href=\'' + publisher.url + '\'>' + ellipsify(publisherLabel(publisher), 30) + '</a><br><span class=\'subvalue\'>' + createdWhen.format('MMM DD, YYYY') + ' ' + createdWhen.fromNow() + '</span>'),
          td(st(publisher.alexa_rank || publisher.audience || 0), 'right'),
          td(publisher.verified ? '<i class="fa fa-check"></i>' : '', 'center'),
          td(publisher.authorized ? '<i class="fa fa-check"></i>' : '', 'center')
        ])
      }
      details.append(buf)
      setTimeout(() => {
        $('#details-publishers-table').fadeIn(400)
      })
    })
  }

  var overviewPublisherHandlerPlatforms = function (categories) {
    var i, cls
    var nav = $('#publisher-platforms-nav-container')
    nav.empty()
    for (i = 0; i < categories.length; i++) {
      cls = categories[i].platform === 'publisher' ? 'active' : ''
      nav.append(`<li role="presentation" data-platform="${categories[i].platform}" class="${cls}"><a class="publisher-platform-nav-item" href="#" data-platform="${categories[i].platform}" id="publisher-platform-nav-item-${categories[i].platform}"><img src='/local/img/publisher-icons/${categories[i].icon_url}' height="24"/> ${categories[i].label}</a></li>`)
    }
  }

  const overviewPublisherHandler = function (channel_totals, publisher_totals) {
    let publishersOverview = $('#publishers_overview')
    const ratio_of_pubs = (n) => { return parseInt(publisher_totals[n] / publisher_totals.email_verified * 100)}
    const ratio_of_channels = (n) => { return parseInt(channel_totals[n] / channel_totals.all_channels * 100)}
    let template = `
      <div class="panel-heading">
        <h3 class="panel-title"><a href="/dashboard#daily_publishers">Publishers</a></h3>
      </div>
      <div class="panel-body">
        <table class="table table-striped" id="publishers_table">
          <thead>
          </thead>
          <tbody>
            <tr><th>E-mail Verified</th><td>${publisher_totals.email_verified.toLocaleString()}</td></tr>
            <tr><th>With a channel</th><td>${publisher_totals.email_verified_with_a_channel.toLocaleString()}<span class="subvalue"> ${ratio_of_pubs('email_verified_with_a_channel')}%</span></td></tr>
            <tr><th>With a verified channel</th><td>${publisher_totals.email_verified_with_a_verified_channel.toLocaleString()}<span class="subvalue"> ${ratio_of_pubs('email_verified_with_a_verified_channel')}%</span></td></tr>
            <tr><th>With Uphold</th><td>${publisher_totals.email_verified_with_a_verified_channel_and_uphold_verified.toLocaleString()}<span class="subvalue"> ${ratio_of_pubs('email_verified_with_a_verified_channel_and_uphold_verified')}%</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="panel-heading">
        <h3 class="panel-title">Channels</h3>
      </div>
      <div class="panel-body">
        <table class="table table-striped" id="channels_table">
          <thead>
            <tr><th>All</th>
            <th><img src="/local/img/publisher-icons/youtube.svg" height="24" /></th>
            <th><img src="/local/img/publisher-icons/internet.svg" height="24" /></th>
            <th><img src="/local/img/publisher-icons/twitch.svg" height="24" /></th>
            </tr>
          </thead>
          <tbody>
          <tr>
          <td>${ channel_totals.all_channels.toLocaleString()}</td>
          <td>${ channel_totals.youtube.toLocaleString()}<span class="subvalue"> ${ratio_of_channels('youtube')}%</span></td>
          <td>${ channel_totals.site.toLocaleString()}<span class="subvalue"> ${ratio_of_channels('site')}%</span></td>
          <td>${ channel_totals.twitch.toLocaleString()}<span class="subvalue"> ${ratio_of_channels('twitch')}%</span></td>
          </tr>
          </tbody>
        </table>
        </div>`
    publishersOverview.html(template)

  }

  var publisherDailyRetriever = function () {
    $.ajax('/api/1/publishers/daily?' + standardParams(), {
      success: dailyPublisherHandler
    })
  }

  var dailyPublisherHandler = function (rows) {

    var table = $('#publisherDataTable tbody')
    table.empty()
    rows.forEach(function (row) {
      var buf = '<tr>'
      buf = buf + '<td>' + row.ymd + '</td>'
      buf = buf + '<td>' + row.total + '</td>'
      buf = buf + '<td>' + row.verified + ' <span class="subvalue">' + numeral(window.STATS.COMMON.safeDivide(row.verified, row.total)).format('0.0%') + '</span></td>'
      buf = buf + '<td>' + row.authorized + ' <span class="subvalue">' + numeral(window.STATS.COMMON.safeDivide(row.authorized, row.total)).format('0.0%') + '</span></td>'
      buf = buf + '</tr>'
      table.append(buf)
    })

    // Build a list of unique labels (ymd)
    var ymds = _.chain(rows)
      .map(function (row) { return row.ymd })
      .uniq()
      .sort()
      .value()

    // Associate the data
    var product = _.object(_.map(ymds, function (ymd) {
      return [ymd, {}]
    }))

    rows.forEach(function (row) {
      product[row.ymd].total = row.total
      product[row.ymd].verified = row.verified
      product[row.ymd].authorized = row.authorized
      product[row.ymd].irs = row.irs
    })

    var ys = ['total', 'verified', 'authorized', 'irs']

    // Build the Chart.js data structure
    var datasets = []
    _.each(ys, function (fld) {
      var dataset = []
      ymds.forEach(function (ymd) {
        dataset.push(product[ymd][fld] || 0)
      })
      datasets.push(dataset)
    })

    var colorer = window.STATS.COLOR.colorForIndex

    var data = {
      labels: ymds,
      datasets: _.map(datasets, function (dataset, idx) {
        return {
          label: ys[idx] || 'All',
          data: dataset,
          borderColor: colorer(idx, 1),
          pointColor: colorer(idx, 0.5),
          backgroundColor: colorer(idx, 0.05)
        }
      })
    }

    var container = $('#publisherChartContainer')
    container.empty()
    container.append('<canvas id=\'publisherChart\' height=\'350\' width=\'800\'></canvas>')

    var usageChart = document.getElementById('publisherChart')
    new Chart.Line(
      usageChart.getContext('2d'),
      {
        data: data,
        options: window.STATS.COMMON.standardYAxisOptions
      }
    )
  }

  window.STATS.PUB = {
    overviewPublisherHandler: overviewPublisherHandler,
    dailyPublisherHandler: dailyPublisherHandler,
    publisherDailyRetriever: publisherDailyRetriever
  }
})()
