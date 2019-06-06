const Joi = require('joi')

const PublisherSignupDaySchema = Joi.object().keys({
  id: Joi.number().integer(),
  'email_channel_and_uphold_verified': Joi.number().integer(),
  'email_channel_verified': Joi.number().integer(),
  'email_verified': Joi.number().integer(),
  'kyc_uphold_and_email_verified': Joi.number().integer(),
  'ymd': Joi.date(),
  'created_at': Joi.date(),
  'updated_at': Joi.date()
})

module.exports = PublisherSignupDaySchema
