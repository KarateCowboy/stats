exports.usageUpserter = function (client, row) {
  return function (cb) {
    client.query('INSERT INTO dw.fc_usage (ymd, platform, version, first_time, channel, ref, total) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (ymd, platform, version, first_time, channel, ref) DO UPDATE SET total = $7', [row._id.ymd, row._id.platform, row._id.version, row._id.first_time, row._id.channel, row._id.ref, row.count], (err, result) => {
      cb(err)
    })
  }
}

exports.usageiOSUpserter = function (client, row) {
  return function (cb) {
    client.query('INSERT INTO dw.fc_ios_usage (ymd, platform, version, first_time, channel, woi, ref, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (ymd, platform, version, first_time, channel, woi, ref) DO UPDATE SET total = $8', [row._id.ymd, row._id.platform, row._id.version, row._id.first_time, row._id.channel, row._id.woi, row._id.ref, row.count], (err, result) => {
      cb(err)
    })
  }
}

exports.usageMonthlyUpserter = async function (client, row) {
  await client.query('INSERT INTO dw.fc_usage_month (ymd, platform, version, channel, ref, total) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (ymd, platform, version, channel, ref) DO UPDATE SET total = $6', [row._id.ymd, row._id.platform, row._id.version, row._id.channel, row._id.ref, row.count])
}

exports.usageiOSMonthlyUpserter = async function (client, row) {
  await client.query('INSERT INTO dw.fc_usage_month (ymd, platform, version, channel, ref, total) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (ymd, platform, version, channel, ref) DO UPDATE SET total = $6', [row._id.ymd, row._id.platform, row._id.version, row._id.channel, row._id.ref, row.count])
}

exports.crashUpserter = function (client, row) {
  return function (cb) {
    client.query('INSERT INTO dw.fc_crashes (ymd, platform, version, channel, total) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ymd, platform, version, channel) DO UPDATE SET total = $5', [row._id.ymd, row._id.platform, row._id.version, row._id.channel, row.count], (err, result) => {
      cb(err)
    })
  }
}

// Also read exceptions from a table and insert / update
var exceptionsSQL = 'INSERT INTO dw.fc_usage ( ymd, platform, version, first_time, channel, ref, total ) SELECT ymd, platform, version, first_time, channel, ref, total from dw.fc_usage_exceptions ON CONFLICT (ymd, platform, version, first_time, channel , ref) DO UPDATE SET total = EXCLUDED.total'

exports.exceptionsUpserter = function (client) {
  return function (cb) {
    client.query(exceptionsSQL, [], function (err, result) {
      console.log('Updating exceptions')
      cb(err)
    })
  }
}

const MOVE_FASTLY_SQL = `
INSERT INTO dw.fc_usage ( ymd, platform, version, channel, first_time, ref, total )
SELECT ymd, platform, version, channel, first_time, ref, SUM(total) as ftotal
FROM dw.fc_fastly_usage FC
WHERE ymd = $1
GROUP BY ymd, platform, version, channel, first_time, ref
ON CONFLICT (ymd, platform, version, first_time, channel, ref) DO UPDATE SET total = EXCLUDED.total
`

exports.moveFastlyToUsageForDay = function (pg, ymd, cb) {
  pg.query(MOVE_FASTLY_SQL, [ymd], cb)
}

const MOVE_FASTLY_MONTH_SQL = `
INSERT INTO dw.fc_usage_month ( ymd, platform, version, channel, ref, total )
SELECT ymd, platform, version, channel, ref, SUM(total) as ftotal
FROM dw.fc_fastly_calendar_month_usage FC
WHERE ymd = $1
GROUP BY ymd, platform, version, channel, ref
ON CONFLICT (ymd, platform, version, channel, ref) DO UPDATE SET total = EXCLUDED.total
`

exports.moveFastlyMonthlyToUsageForDay = function (pg, ymd, cb) {
  pg.query(MOVE_FASTLY_MONTH_SQL, [ymd], cb)
}

const MOVE_IOS_DAILY_SQL = `
INSERT INTO dw.fc_usage ( ymd, platform, version, channel, first_time, ref, total )
SELECT ymd, platform, version, channel, first_time, ref, SUM(total) as ftotal
FROM dw.fc_ios_usage FC
WHERE ymd >= $1 AND ymd >= '2017-12-14'
GROUP BY ymd, platform, version, channel, first_time, ref
ON CONFLICT (ymd, platform, version, channel, first_time, ref) DO UPDATE SET total = EXCLUDED.total
`

exports.moveiOSUsageToUsage = async (client, ymd) => {
  return (await client.query(MOVE_IOS_DAILY_SQL, [ymd]))
}
