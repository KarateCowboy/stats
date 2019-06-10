const moment = require('moment')
const logger = require('../common').logger
const _ = require('underscore')
const numeral = require('numeral')

const DELETE_QUERY = 'DELETE FROM [TABLE] WHERE ymd = $1'

const QUERY = `
INSERT INTO [TABLE] (ymd, platform, version, first_time, channel, ref, woi, doi, country_code, total) VALUES
($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (ymd, platform, version, first_time, channel, ref, woi, doi, country_code) DO UPDATE SET total = $10
`

module.exports = class CommonAggregation {
  async main (latest, days, purge, type, collections) {
    for (let i = 0; i < days; i++) {
      const date = latest.clone().subtract(i, 'days')
      const dateYMD = date.format('YYYY-MM-DD')
      if (purge) {
        logger.info(`removing all records for ${dateYMD}`)
        await this.deleteRecordsForYMD(dateYMD, type)
      }
      logger.info(`aggregating for ${dateYMD}`)
      for (let collection of collections) {
        let summarized = await this.summarize(dateYMD, type, collection)

        // this changes values in the primary key (eg. woi and doi)
        summarized = this.cleanRecords(summarized)
        // hence the need to recombine rows
        summarized = this.recombine(summarized)

        logger.info(`  ${collection} writing ${summarized.length} records`)
        const results = await this.writeSummarizedRecords(summarized, type)
      }
    }
  }

  async deleteRecordsForYMD (ymd, type) {
    const substitutedQuery = DELETE_QUERY.replace('[TABLE]', 'dw.fc_agg_usage_' + type)
    await pg_client.query(substitutedQuery, [ymd])
  }

  cleanRecords (records) {
    const validChannels = {
      dev: true, unknown: true, stable: true, developer: true, nightly: true, beta: true, release: true
    }
    records.forEach((row) => {
      row.ref = row.ref.replace(/[^A-Za-z0-9_\-]/g, '')
      row.version = row.version.replace(/[^0-9\.]/g, '')
      row.channel = row.channel.replace(/[^A-Za-z]/g, '')

      row.woi = row.woi.trim()
      if (!row.woi.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/g)) {
        let [y, m, d] = row.woi.split('-')
        let newYMD = numeral(y).format('0000') + '-' + numeral(m).format('00') + '-' + numeral(d).format('00')
        if (process.env.DEBUG) logger.warn(`reset bad woi ${row.woi} to ${newYMD}`)

        row.original_woi = row.woi
        row.woi = newYMD
      }

      row.doi = row.doi.trim()
      if (!row.doi.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/g)) {
        let [y, m, d] = row.doi.split('-')
        let newYMD = numeral(y).format('0000') + '-' + numeral(m).format('00') + '-' + numeral(d).format('00')
        if (process.env.DEBUG) logger.warn(`reset bad doi ${row.doi} to ${newYMD}`)

        row.original_doi = row.doi
        row.doi = newYMD
      }

      row.channel = row.channel || 'unknown'
      if (!validChannels[row.channel]) row.channel = 'unknown'
      if (row.ref === '') row.ref = 'none'
      if (row.platform === 'android') row.platform = 'androidbrowser'
    })
    return records
  }

  recombine (summarized) {
    let combined = []
    const grouped = _.groupBy(summarized, (record) => {
      return [record.ymd, record.platform, record.version, record.first_time, record.channel, record.ref, record.doi, record.country_code]
    })
    _.each(grouped, (v, k) => {
      if (v.length > 1) {
        let sum = _.reduce(v, (memo, value) => { return memo + value.count }, 0)
        let newRecord = _.clone(v[0])
        newRecord.count = sum
        combined.push(newRecord)
      } else {
        combined.push(v[0])
      }
    })
    return combined
  }

  async summarize (ymd, type, collection) {
    const ymdRenderer = {
      monthly: {
        $dateToString: {
          format: '%Y-%m-%d', date: {
            $add: [(new Date(-5 * 60 * 60000)), '$ts']
          }
        }
      },
      daily: {
        $ifNull: ['$year_month_day', '2016-02-10']
      },
      weekly: {
        $ifNull: ['$year_month_day', '2016-02-10']
      }
    }

    const matcher = {
      daily: { daily: true },
      weekly: { daily: true, weekly: true },
      monthly: { monthly: true }
    }[type]

    const query = mongo_client.collection(collection).aggregate([
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
          ymd: ymdRenderer[type]
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
    ], {explain: false, allowDiskUse: true})

    return (await query.toArray()).map((row) => {
      row._id.count = row.count
      return row._id
    })
  }

  async writeSummarizedRecords (records, type) {
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
}
