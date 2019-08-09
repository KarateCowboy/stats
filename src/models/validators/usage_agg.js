const Joi = require('joi')

const UsageSchema = Joi.object().keys({
  ymd: Joi.string().regex(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/).required(),
  platform: Joi.string().valid('ios', 'android', 'androidbrowser', 'osx', 'winia32', 'winx64', 'linux', 'unknown', 'osx-bc', 'linux-bc', 'winx64-bc', 'winia32-bc', 'android-bc').required(),
  channel: Joi.any().valid('beta', 'stable', 'developer', 'nightly', 'dev').required(),
  version: Joi.string().regex(/[\d]{1,2}\.[\d]{1,2}\.[\d]{1,2}/).required(),
  ref: Joi.any().optional(),
  woi: Joi.string().regex(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/).required(),
  doi: Joi.string().regex(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/).required(),
  country_code: Joi.string().regex(/^[A-Z]{2,2}|(unknown)/),
  first_time: Joi.boolean().required(),
  total: Joi.number().integer().required()
})

module.exports = UsageSchema

