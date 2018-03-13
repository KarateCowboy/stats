const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class IosUsageRecord {
    async save () {
    }

    async destroy () {
    }
  }

  factory.define('ios_usage_aggregate_woi', IosUsageRecord, {
    '_id': () => (new ObjectID()),
    'daily': true,
    'weekly': true,
    'monthly': true,
    'platform': 'ios',
    'version': '1.5.1',
    'first': true,
    'channel': 'stable',
    'woi': () => moment().subtract(2, 'months').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
    'ref': 'none',
    'ts': () => moment().subtract(2, 'months').toDate().getTime(),
    'year_month_day': () => moment().subtract(2, 'months').format('YYYY-MM-DD')

  })
  factory.extend('ios_usage_aggregate_woi', 'ios_usage_record_bad_woi', {
    'woi': '12-34-56'
  })

}
module.exports.define = define

