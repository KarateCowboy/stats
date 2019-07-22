const Joi = require('joi')

const PlatformSchema = Joi.object().keys({
  chromium_version: Joi.string().required(),
  brave_version: Joi.string().required(),
  uses_hybrid_format: Joi.boolean()
})

module.exports = PlatformSchema
