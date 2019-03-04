const Script = require('./script')
const ThirtyDayAggregation = require('../src/services/thirty-day-aggregation.service')

class AggregationScript extends Script {
  constructor () {
    super('thirty-day-retention')
  }

  async run () {
    await this.setup()
    const args = this.yargs
      .default('days', 1, 'Number of days to aggregate')
      .default('delete', false)
      .describe('latest', 'Date to start aggregation from, working backwards')
      .argv
    this.logger.info(JSON.stringify(args))
    if (args.latest) {
      args.latest = this.moment(args.latest)
    } else {
      args.latest = this.moment()
    }

    const thirtyDayAggregation = new ThirtyDayAggregation()
    await thirtyDayAggregation.main(
      args.latest,
      args.days,
      args.delete
    )

    await this.shutdown()
  }

}

const aggregationScript = new AggregationScript()
aggregationScript.run()
