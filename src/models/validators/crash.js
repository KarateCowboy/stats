const Joi = require('joi')

const CrashSchema = Joi.object().keys({
  id: Joi.string().regex(/^[0-9a-z]{24,24}$/),
  contents: Joi.object(),
  ts: Joi.any(),
  is_core: Joi.boolean(),
  has_valid_version: Joi.boolean(),
  channel: Joi.string(),
  platform: Joi.string(),
  ymd: Joi.date(),
  updated_at: Joi.any().optional(),
  expiration_attempted_at: Joi.any().optional(),
  version: Joi.any().optional()
})

module.exports = CrashSchema
