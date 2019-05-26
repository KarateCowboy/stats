const Joi = require('joi')

const ChannelSchema = Joi.object().keys({
  id: Joi.string().regex(/^[0-9a-z]{24,24}$/),
  contents: Joi.object(),
  ts: Joi.any()
})

module.exports = ChannelSchema
