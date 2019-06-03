const moment = require('moment')

module.exports = class UpdatePostgresDay {
  async main (collection_name, days=7) {
    // Retrieve the daily active user stats
    let results = await this.dau_grouped(collection_name, days)

    if(!process.env.TEST){
      console.log('Updating ' + results.length + ' rows in Postgres')
    }
    results.forEach((result) => {
      result._id.woi = result._id.woi || '2016-01-04'
      result._id.ref = result._id.ref || 'none'
    })

    // filter out wrong version formats
    results = results.filter(function (result) {
      return result._id.version.match(new RegExp('^\\d+\\.\\d+\\.\\d+$')) && ['dev', 'stable', 'beta', 'release', 'nightly'].includes(result._id.channel)
    })

    // filter out back ref codes
    results = results.filter((row) => {
      return row._id.ref.match(/[A-Za-z0-9_\-]+/)
    })

    // Insert / Update the exceptions

    // funcs.push(model.exceptionsUpserter(resources.pg))
    for (let row of results) {
      await pg_client.query('INSERT INTO dw.fc_usage (ymd, platform, version, first_time, channel, ref, total) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (ymd, platform, version, first_time, channel, ref) DO UPDATE SET total = $7', [row._id.ymd, row._id.platform, row._id.version, row._id.first_time, row._id.channel, row._id.ref, row.count])
    }
    await knex.raw('REFRESH MATERIALIZED VIEW dw.fc_usage_platform_mv ')

  }

  async dau_grouped (collection_name, days=7) {
    let ts = (new Date()).getTime()

    var limit = moment().subtract(days, 'days').format('YYYY-MM-DD')
    if(!process.env.TEST){
      console.log(`Retrieving records on and after ${limit}`)
    }
    const query = await mongo_client.collection(collection_name).aggregate([
      {
        $match: {
          year_month_day: {$gte: limit}
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
          ref: {
            $ifNull: ['$ref', 'none']
          },
          ymd: {
            $ifNull: ['$year_month_day', '2016-02-10']
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
          '_id.platform': 1,
          '_id.version': 1,
          '_id.first_time': 1,
          '_id.channel': 1,
          '_id.ref': 1
        }
      }
    ], {explain: false})

    return query.toArray()
  }

}
