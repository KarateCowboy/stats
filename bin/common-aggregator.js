require('dotenv').config()

const moment = require('moment')
const common = require('../src/common')
const logger = common.logger
const CommonAggregation = require('../src/services/common-aggregation.service')

const commonAggregation = new CommonAggregation()

const args = require('yargs')
  .default('days', 1, 'Number of days to aggregate')
  .choices('type', ['daily', 'weekly', 'monthly'])
  .default('type', 'daily')
  .default('delete', false)
  .describe('latest', 'Date to start aggregation from working backwards')
  .argv

args.collections = ['brave_core_usage', 'usage', 'android_usage', 'ios_usage']

if (args.latest) {
  args.latest = moment(args.latest)
} else {
  args.latest = moment()
}

const main = async () => {
  logger.info(JSON.stringify(args))

  await commonAggregation.connectToDatabases()
  await commonAggregation.main(
    args.latest,
    args.days,
    args.delete,
    args.type,
    args.collections
  )
  await commonAggregation.disconnectFromDatabases()
}

main(args)
