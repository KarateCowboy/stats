const joi = require('joi')
const schema = joi.object().keys({
  year_month_day: joi.string().regex(/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/).required(),
  daily: joi.boolean().required(),
  weekly: joi.boolean().required(),
  monthly: joi.boolean().required(),
  platform: joi.string().valid('androidbrowser'),
  version: joi.string().regex(/[\d]{1,2}\.[\d]{1,2}\.[\d]{1,2}/).required(),
  first: joi.boolean().required(),
  channel: joi.string().valid('stable').required(),
  woi: joi.string().regex(/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/).required(),
  ref: joi.any().optional(),
  ts: joi.number().required(),
  '_id': joi.object().required()

})

class AndroidUsage {
  static is_valid (record) {
    const result = joi.validate(record, schema)
    if (result.error) {
      return false
    } else {
      return true
    }
  }

}

module.exports.AndroidUsage = AndroidUsage
