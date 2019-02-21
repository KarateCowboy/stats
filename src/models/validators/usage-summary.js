const Joi = require('joi')

const UsageSummarySchema = Joi.object().keys({
  id: Joi.number().integer(),
  ymd: Joi.date(),
  platform: Joi.string().min(3),
  count: Joi.number().integer(),
  version: Joi.string(),
  first_time: Joi.boolean(),
  total: Joi.number().integer(),
  ref: Joi.string(),
  channel: Joi.string(),
  created_at: Joi.string(),
  updated_at: Joi.string()
})

module.exports = UsageSummarySchema
