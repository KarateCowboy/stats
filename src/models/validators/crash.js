const Joi = require('joi')

const CrashSchema = Joi.object().keys({
  id: Joi.string().regex(/^[0-9a-z]{24,24}$/),
  contents: Joi.object(),
  ts: Joi.any()
})

module.exports = CrashSchema
