const joi = require('joi')
const moment = require('moment')

const joiSchema = joi.object().keys({
  woi: joi.string().regex(/[\d]{4,4}-[\d]{1,2}-[\d]{1,2}/).required(),
  year_month_day: joi.string().regex(/[\d]{4,4}-[\d]{2,2}-[\d]{2,2}/).required(),
  version: joi.string().regex(/[\d]+\.[\d]+\.[\d]+/),
  _id: joi.any(),
  daily: joi.any(),
  channel: joi.any(),
  ref: joi.any(),
  total: joi.any(),
  platform: joi.any(),
  first_time: joi.any(),
  weekly: joi.any(),
  monthly: joi.any(),
  ts: joi.any(),
  first: joi.any()

})

let joiValidationErrors = null

class IosUsageRecord {
  static get schema () {
    return joiSchema
  }

  static get validationErrors () {
    return joiValidationErrors
  }

  static scrub (row) {
    this.validate(row)
    if (this.validationErrors && this.validationErrors.message.match(/woi/)) {
      row.woi = this.woiFromYMD(row.year_month_day)
    }
    if (row.version.match(/[\d]{1,2}(\.[\d]{1,2}){2,2}/) === null) {
      row.version = `${row.version.trim()}.0`
    }
    return row
  }

  static validate (ios_record) {
    const result = joi.validate(ios_record, this.schema)
    if (result.error) {
      joiValidationErrors = result.error
    } else {
      joiValidationErrors = null
    }
    return result.error === null
  }

  static woiFromYMD (ymd) {
    return moment(ymd).startOf('week').add(1, 'days').format('YYYY-MM-DD')
  }
}

module.exports = IosUsageRecord

