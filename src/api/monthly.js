const common = require('./common')
const Boom = require('boom')

const MAU_PLATFORM = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  platform,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ymd > '2016-01-31' AND
  ref = ANY(COALESCE($3, ARRAY[ref]))
GROUP BY
  left(ymd::text, 7),
  platform
ORDER BY
  left(ymd::text, 7),
  platform
`

const MAU = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  sum(total) AS count
FROM dw.fc_usage_month
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY(COALESCE($3, ARRAY[ref])) AND
  ymd > '2016-01-31'
GROUP BY
  left(ymd::text, 7)
ORDER BY
  left(ymd::text, 7)
`

const MRU = `
SELECT
  LEFT(ymd::text, 7) || '-01' AS ymd,
  sum(total) AS count
FROM dw.fc_agg_usage_monthly
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY(COALESCE($3, ARRAY[ref])) AND
  ymd > '2016-01-31' AND
  NOT first_time
GROUP BY
  LEFT(ymd::text, 7)
ORDER BY
  LEFT(ymd::text, 7)
`

const MRU_PLATFORM = `
SELECT
  platform,
  LEFT(ymd::text, 7) || '-01' AS ymd,
  sum(total) AS count
FROM dw.fc_agg_usage_monthly
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY(COALESCE($3, ARRAY[ref])) AND
  ymd > '2016-01-31' AND
  NOT first_time
GROUP BY
  LEFT(ymd::text, 7),
  platform
ORDER BY
  LEFT(ymd::text, 7),
  platform
`
const AVERAGE_MONTHLY_DAU = `
SELECT ymd, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY (COALESCE($3, ARRAY[ref]))
GROUP BY ymd
ORDER BY ymd DESC
`

const AVERAGE_MONTHLY_DAU_PLATFORM = `
SELECT ymd, platform, SUM(average_dau) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY (COALESCE($3, ARRAY[ref]))
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

const AVERAGE_MONTHLY_FIRST_DAU = `
SELECT ymd, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY(COALESCE($3, ARRAY[ref]))
GROUP BY ymd
ORDER BY ymd DESC
`

const AVERAGE_MONTHLY_FIRST_DAU_PLATFORM = `
SELECT ymd, platform, SUM(average_first_time) AS count
FROM dw.fc_average_monthly_usage_mv
WHERE
  platform = ANY ($1) AND
  channel = ANY ($2) AND
  ref = ANY (COALESCE($3, ARRAY[ref]))
GROUP BY ymd, platform
ORDER BY ymd DESC, platform
`

exports.setup = (server, client, mongo) => {
  // Monthly active users by platform
  server.route({
    method: 'GET',
    path: '/api/1/mau_platform',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(MAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      return (results.rows)
    }
  })

  // Monthly returning users by platform
  server.route({
    method: 'GET',
    path: '/api/1/mru_platform',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(MRU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      return (results.rows)
    }
  })

  // Monthly active users
  server.route({
    method: 'GET',
    path: '/api/1/mau',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(MAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      return (results.rows)
    }
  })

  // Monthly returning users
  server.route({
    method: 'GET',
    path: '/api/1/mru',
    handler: async (request, h) => {
      try {
        let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
        let results = await client.query(MRU, [platforms, channels, ref])
        results.rows.forEach((row) => common.formatPGRow(row))
        results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
        return (results.rows)
      } catch (e) {
        console.trace(e)
        return Boom.badImplementation(e)
      }
    }
  })

  // Monthly average daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_monthly_average',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_DAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      return (results.rows)
    }
  })

  // Monthly average daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_monthly_average_platform',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_DAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      console.dir(results.rows, { colors: true })
      return (results.rows)
    }
  })

  // Monthly average daily first time users
  server.route({
    method: 'GET',
    path: '/api/1/dau_first_monthly_average',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_FIRST_DAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      return (results.rows)
    }
  })

  // Monthly average daily first time users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_first_monthly_average_platform',
    handler: async function (request, h) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_FIRST_DAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      return (results.rows)
    }
  })
}
