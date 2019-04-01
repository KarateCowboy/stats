const Joi = require('joi')

const PublisherTotalSchema = Joi.object().keys({
  id: Joi.number().integer(),
  'email_verified_with_a_verified_channel_and_uphold_verified': Joi.number().integer(),
  'email_verified_with_a_verified_channel': Joi.number().integer(),
  'email_verified_with_a_channel': Joi.number().integer(),
  'email_verified': Joi.number().integer(),
  'created_at': Joi.date(),
  'updated_at': Joi.date()
})

module.exports = PublisherTotalSchema
