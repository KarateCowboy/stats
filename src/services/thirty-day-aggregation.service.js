const moment = require('moment')
const logger = require('../common').logger
const common = require('../api/common')

const ENDPOINT = `${process.env.PROMO_SERVICES_URL}/api/1/promo/stats/daily`

const QUERY = `
INSERT INTO dw.fc_thirty_day_referral_stats (
  ymd, ref, platform, downloads, installs, confirmations
) VALUES ( $1, $2, $3, $4, $5, $6 )
ON CONFLICT (ymd, ref, platform) DO UPDATE SET downloads = $4, installs = $5, confirmations = $6
`

const platformMappings = {
  'winx64': 'winx64-bc',
  'winia32': 'winia32-bc',
  'osx': 'osx-bc',
  'linux': 'linux-bc',
  'android': 'androidbrowser',
  'ios': 'ios'
}

module.exports = class ThirtyDayAggregation {
  async updateSummary (rows) {
    let row
    try {
      await pg_client.query('BEGIN TRANSACTION')
      for (row of rows) {
        if (platformMappings[row.platform]) row.platform = platformMappings[row.platform]
        await pg_client.query(QUERY, [
          row.ymd, row.referral_code, row.platform, row.retrievals, row.first_runs, row.finalized
        ])
      }
      await pg_client.query('COMMIT')
    } catch (e) {
      await pg_client.query('ROLLBACK')
      logger.error(JSON.stringify(row), e)
      process.exit(1)
    }
  }

  async main (latest, days, purge) {
    for (let i = 0; i < days; i++) {
      logger.info(`thirty day retention ${latest.format('YYYY-MM-DD')}`)
      let results = await common.requestWithAuth(
        `${ENDPOINT}?ymd=${latest.format('YYYY-MM-DD')}`,
        process.env.PROMO_SERVICES_TOKEN
      )
      await this.updateSummary(JSON.parse(results))
      latest = latest.clone().subtract(1, 'day')
    }
  }
}
