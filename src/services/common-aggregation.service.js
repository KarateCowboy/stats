const moment = require('moment')
const logger = require('../common').logger

const cleanRecords = (records) => {
  records.forEach((row) => {
    row.ref = row.ref.replace(/[^A-Za-z0-9_\-]/g, '')
    row.version = row.version.replace(/[^0-9\.]/g, '')
    if (row.ref === '') row.ref = 'none'
    if (row.platform === 'android') row.platform = 'androidbrowser'
    let woi = moment(row.woi)
    if (!woi.isValid()) {
      row.woi = '2016-02-10'
    }
    let doi = moment(row.doi)
    if (!doi.isValid()) {
      row.doi = '2016-02-10'
    }
  })
}

const DELETE_QUERY = 'DELETE FROM [TABLE] WHERE ymd = $1'

const deleteRecordsForYMD = async (ymd, type) => {
  const substitutedQuery = DELETE_QUERY.replace('[TABLE]', 'dw.fc_agg_usage_' + type)
  await pg_client.query(substitutedQuery, [ymd])
}

const summarize = async (ymd, type, collection) => {
  const matcher = {
    daily: {daily: true},
    weekly: {daily: true, weekly: true},
    monthly: {monthly: true}
  }[type]

  var query = mongo_client.collection(collection).aggregate([
    {
      $match: {
        year_month_day: ymd
      }
    },
    {
      $match: matcher
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
        woi: {
          $ifNull: ['$woi', '2016-02-10']
        },
        doi: {
          $ifNull: ['$doi', {$ifNull: ['$woi', '2016-02-10']}]
        },
        country_code: {
          $ifNull: ['$country_code', 'unknown']
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
          ref: '$ref',
          woi: '$woi',
          doi: '$doi',
          country_code: '$country_code'
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
        '_id.ref': 1,
        '_id.doi': 1,
        '_id.country_code': 1
      }
    }
  ], {explain: false})

  return (await query.toArray()).map((row) => {
    row._id.count = row.count
    return row._id
  })
}

const QUERY = `
INSERT INTO [TABLE] (ymd, platform, version, first_time, channel, ref, woi, doi, country_code, total) VALUES
($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (ymd, platform, version, first_time, channel, ref, woi, doi, country_code) DO UPDATE SET total = $10
`

const writeSummarizedRecords = async (records, type) => {
  const substitutedQuery = QUERY.replace('[TABLE]', 'dw.fc_agg_usage_' + type)
  let row
  try {
    await pg_client.query('BEGIN TRANSACTION')
    for (row of records) {
      await pg_client.query(substitutedQuery, [
        row.ymd, row.platform, row.version, row.first_time, row.channel, row.ref, row.woi, row.doi, row.country_code, row.count
      ])
    }
    await pg_client.query('COMMIT')
  } catch (e) {
    await pg_client.query('ROLLBACK')
    logger.error(JSON.stringify(row), e)
    process.exit(1)
  }
}

module.exports = class CommonAggregation {
  async main (latest, days, purge, type, collections) {
    for (let i = 0; i < days; i++) {
      const date = latest.clone().subtract(i, 'days')
      const dateYMD = date.format('YYYY-MM-DD')
      if (purge) {
        logger.info(`removing all records for ${dateYMD}`)
        await deleteRecordsForYMD(dateYMD, type)
      }
      logger.info(`aggregating for ${dateYMD}`)
      for (let collection of collections) {
        const summarized = await summarize(dateYMD, type, collection)
        cleanRecords(summarized)
        logger.info(`  ${collection} writing ${summarized.length} records`)
        const results = await writeSummarizedRecords(summarized, type)
      }
    }
  }
}
