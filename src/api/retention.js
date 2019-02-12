const common = require('./common')
const moment = require('moment')

const WEEKLY_RETENTION_START = `
SELECT SUM(FC.total) AS count
FROM dw.fc_agg_usage_weekly FC
WHERE
  fc.woi = $1 AND
  first_time AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = ANY(COALESCE($4, ARRAY[ref])) AND
  FC.woi = ANY(COALESCE($5, ARRAY[woi]))
`

const WEEKLY_RETENTION = `
SELECT SUM(FC.total) AS count
FROM dw.fc_agg_usage_weekly FC
WHERE
  fc.woi = $1 AND
  (FC.ymd >= $2 AND FC.ymd < $3) AND
  FC.platform = ANY ($4) AND
  FC.channel = ANY ($5) AND
  FC.ref = ANY(COALESCE($6, ARRAY[ref])) AND
  FC.woi = ANY(COALESCE($7, ARRAY[woi]))
`

exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/retention_week',
    handler: async function (request, reply) {
      try {
        let platforms = common.platformPostgresArray(request.query.platformFilter)
        let channels = common.channelPostgresArray(request.query.channelFilter)
        let ref = (request.query.ref ? request.query.ref : '').split(',').filter((ref) => {
          return ref && ref !== ''
        })
        if (ref.length === 0) ref = null
        let wois = request.query.wois ? request.query.wois.split(',') : null

        let SIZE = 13
        let data = []
        let mostRecentMonday = moment().startOf('week').add(1, 'day')
        let firstMonday = mostRecentMonday.clone().subtract(SIZE - 1, 'weeks')
        let currentSize = SIZE
        for (let row = 0; row < SIZE; row += 1) {
          let monday = firstMonday.clone().add(row, 'weeks')
          let s = (await client.query(WEEKLY_RETENTION_START, [
              monday.format('YYYY-MM-DD'),
              platforms,
              channels,
              ref,
              wois
            ])).rows[0]
          for (let col = 1; col < currentSize; col += 1) {
            let compMonday = monday.clone().add(col, 'weeks')
            let r = (await client.query(WEEKLY_RETENTION, [
              monday.format('YYYY-MM-DD'),
              compMonday.format('YYYY-MM-DD'),
              compMonday.clone().add(7, 'days').format('YYYY-MM-DD'),
              platforms,
              channels,
              ref,
              wois
            ])).rows[0]
            data.push({
              woi: monday.format('YYYY-MM-DD'),
              week_actual: compMonday.format('YYYY-MM-DD'),
              week_delta: col,
              current: r.count,
              starting: s.count,
              retained_percentage: r.count / s.count,
              start: compMonday.format('YYYY-MM-DD'),
              end: compMonday.clone().add(7, 'days').format('YYYY-MM-DD')
            })
          }
          currentSize -= 1
        }
        reply(data)
      } catch (e) {
        console.log(e.message)
        reply(e.toString()).code(500)
      }
    }
  })
}
