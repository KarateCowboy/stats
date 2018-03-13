const common = require('../api/common')
const moment = require('moment')
const IosUsageRecord = require('./ios_usage_record')
const AndroidUsageAggregateWeek = require('./android_usage_aggregate_week')

const WEEKLY_RETENTION_QUERY = `
SELECT
  woi,
  week_delta,
  sum(current) as current,
  sum(starting) as starting,
  sum(current) / sum(starting) as retained_percentage
FROM dw.fc_retention_week_mv FC
WHERE
  FC.platform = ANY ($1) AND
  FC.channel  = ANY ($2) AND
  FC.ref      = ANY ($3) AND
  fc.woi::date > (current_date - interval '90' day)::date AND
  fc.woi::date <= (current_date - interval '1' day)::date 
GROUP BY
  woi,
  week_delta
ORDER BY
  woi,
  week_delta
`

class RetentionMonth {
  static async refresh () {
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_month_mv')
  }
}

class RetentionWeek {
  static async refresh () {
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_retention_week_mv')
  }

  static async aggregated (platform, channel, ref) {
    let rows
    const result = await pg_client.query(WEEKLY_RETENTION_QUERY, [platform, channel, ref])
    rows = result.rows.filter(row => {
      const monday = moment(row.woi).startOf('week').add(1, 'days')
      return (moment(row.woi).diff(monday, 'days') === 0)
    })

    for (let row of rows) {
      common.convertPlatformLabels(row)
      row.current = parseInt(row.current)
      row.starting = parseInt(row.starting)
      row.retained_percentage = parseFloat(row.retained_percentage)
      row.month_delta = parseInt(row.month_delta)
      row.week_delta = parseInt(row.week_delta)
      if (row.week_delta === 0) {
        row.retained_percentage = 1.0
      }
    }
    return rows
  }

}

class WeekOfInstall {
  static async transfer_platform_aggregate (collection_name, start_date) {
    let results = await mongo_client.collection(collection_name).aggregate([
      {
        $match: {
          year_month_day: {$gte: start_date},
          woi: {$exists: true}
        }
      },
      {
        $match: {daily: true}
      },
      {
        $project: {
          date: {
            $add: [(new Date(0)), '$ts']
          },
          platform: {
            $ifNull: ['$platform', 'unknown']
          },
          version: {
            $ifNull: ['$version', '0.0.0']
          },
          first_time: {
            $ifNull: ['$first', false]
          },
          channel: {
            $ifNull: ['$channel', 'dev']
          },
          ymd: {
            $ifNull: ['$year_month_day', '2016-02-10']
          },
          woi: {
            $ifNull: ['$woi', '2016-01-04']
          },
          ref: {
            $ifNull: ['$ref', 'none']
          }
        }
      },
      {
        $group: {
          _id: {
            ymd: '$ymd',
            platform: '$platform',
            version: '$version',
            first_time: '$first_time',
            channel: '$channel',
            woi: '$woi',
            ref: '$ref'
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          '_id.ymd': -1,
          '_id.woi': -1,
          '_id.platform': 1,
          '_id.version': 1,
          '_id.first_time': 1,
          '_id.channel': 1,
          '_id.ref': 1
        }
      }
    ], {
      explain: false,
      allowDiskUse: true
    }).toArray()
    const aggregate_collection = `${collection_name}_aggregate_woi`
    const collections = await mongo_client.collections()
    if (collections.map(c => c.name).includes(aggregate_collection)) {
      await mongo_client.collection(aggregate_collection).drop()
    }
    await mongo_client.createCollection(aggregate_collection)
    for (let i in results) {
      try {
        if (results[i]._id.platform === 'android') {
          results[i] = AndroidUsageAggregateWeek.scrub(results[i])
        }
        await mongo_client.collection(aggregate_collection).insert(results[i])
      } catch (e) {
        if (e.message.match(/11000/) === undefined) {
          console.log(`Error inserting ${results[i]._id} to ${aggregate_collection}
          ${e.message}`)
        }
      }
    }
  }

  static from_usage_aggregate_woi (entry) {
    let actual_record = entry._id
    if (actual_record.platform === 'ios') {
      actual_record = IosUsageRecord.scrub(actual_record)
    }
    actual_record.total = entry.count
    return actual_record
  }
}

module.exports.RetentionMonth = RetentionMonth
module.exports.RetentionWeek = RetentionWeek
module.exports.WeekOfInstall = WeekOfInstall

