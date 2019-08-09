const mongooseClient = require('mongoose')
module.exports = function () {
  const {Schema} = mongooseClient
  const CoreUsageDay = new Schema({
    _id: {
      'ymd': {
        required: true,
        type: Schema.Types.String,
        validate: {
          validator: function (v) { return /[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/.test(v) }
        }
      },
      version: {
        type: Schema.Types.String,
        validate: {
          validator: function (v) {
            return /^[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}/.test(v)
          }
        }
      },
      platform: {
        type: Schema.Types.String,
        validate: {
          validator: function (v) { return ['osx-bc', 'linux-bc', 'winia32-bc', 'winx64-bc', 'android-bc'].includes(v) }
        }
      },
      channel: {
        type: Schema.Types.String,
        required: true,
        validate: {
          validator: function (v) {
            return ['release', 'beta', 'dev', 'stable'].includes(v)
          }
       }
      },
      woi: {
        type: Schema.Types.String,
        required: true,
        validate: {
          validator: function (v) {
            return /^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/.test(v)
          }
        }
      },
      ref: {
        type: Schema.Types.String,
        default: 'none',
        validate: {
          validator: function (v) {
            return /^[A-Z0-9]{5,7}/.test(v) || v === 'none'
          }
        }
      },
      first_time: {
        type: Schema.Types.Boolean,
        required: true
      }
    },
    usages: []
  }, {
    timestamps: true,
    collection: 'brave_core_usage_aggregate_woi'
  })

  return mongooseClient.model('CoreUsageDay', CoreUsageDay)
}
