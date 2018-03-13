const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class AndroidUsageAggregateWeek {
    async save () {
    }

    async destroy () {
      await mongo_client.collection('android_usage_aggregate_woi').destroy({'_id': this._id})
    }
  }

  factory.define('android_usage_aggregate_week', AndroidUsageAggregateWeek, {
    '_id': {
      'ymd': '2018-04-24',
      'platform': 'android',
      'version': '1.0.42',
      'first_time': false,
      'channel': 'stable',
      'woi': () => moment().subtract(2, 'months').startOf('week').add(5, 'days').format('YYYY-MM-DD'),
      'ref': () => (new ObjectID()).toString().toUpperCase().slice(0, 6)
    },
    'count': 30
  })

}

module.exports.define = define

