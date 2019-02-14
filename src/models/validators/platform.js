const Joi = require('joi')

const PlatformSchema = Joi.object().keys({
  platform: Joi.string().required(),
  label: Joi.string().required(),
  description: Joi.string().required()
})

module.exports = PlatformSchema
