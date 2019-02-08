const Joi = require('joi')

const ReferralCodeSchema = Joi.object().keys({
  id: Joi.number().integer(),
  code_text: Joi.string().regex(/^[A-Z0-9]{6,6}$|(none)/).required().label('code_text may only consist of numbers and upper-case roman letters and be six characters long'),
  campaign_id: Joi.number().integer()
})

module.exports = ReferralCodeSchema
