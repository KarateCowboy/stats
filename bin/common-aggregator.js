const Script = require('./script')
const CommonAggregation = require('../src/services/common-aggregation.service')

class AggregationScript extends Script {
  constructor () {
    super('common-aggregator')
  }

  async run () {
    await this.setup()
    const args = this.yargs
      .default('days', 1, 'Number of days to aggregate')
      .choices('type', ['daily', 'weekly', 'monthly'])
      .default('type', 'daily')
      .default('delete', false)
      .describe('latest', 'Date to start aggregation from working backwards')
      .argv
    this.logger.info(JSON.stringify(args))
    if (args.latest) {
      args.latest = this.moment(args.latest)
    } else {
      args.latest = this.moment()
    }
    args.collections = ['brave_core_usage', 'usage', 'android_usage', 'ios_usage']

    const commonAggregation = new CommonAggregation()
    await commonAggregation.main(
      args.latest,
      args.days,
      args.delete,
      args.type,
      args.collections
    )

    await this.shutdown()
  }
}

const aggregationScript = new AggregationScript()
aggregationScript.run()
