const common = require('./common')

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
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(MAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Monthly active users
  server.route({
    method: 'GET',
    path: '/api/1/mau',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      console.log([platforms, channels, ref])
      let results = await client.query(MAU, [platforms, channels, ref])
      console.log(results.rows)
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterThisMonth(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Monthly average daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_monthly_average',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_DAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Monthly average daily active users
  server.route({
    method: 'GET',
    path: '/api/1/dau_monthly_average_platform',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_DAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })

  // Monthly average daily first time users
  server.route({
    method: 'GET',
    path: '/api/1/dau_first_monthly_average',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_FIRST_DAU, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      reply(results.rows)
    }
  })

  // Monthly average daily first time users by platform
  server.route({
    method: 'GET',
    path: '/api/1/dau_first_monthly_average_platform',
    handler: async function (request, reply) {
      let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
      let results = await client.query(AVERAGE_MONTHLY_FIRST_DAU_PLATFORM, [platforms, channels, ref])
      results.rows.forEach((row) => common.formatPGRow(row))
      results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
      results.rows.forEach((row) => common.convertPlatformLabels(row))
      reply(results.rows)
    }
  })
}
