const Joi = require('joi')

const ChannelSchema = Joi.object().keys({
  channel: Joi.string().required(),
  label: Joi.string().required(),
  description: Joi.string().required()
})

module.exports = ChannelSchema
