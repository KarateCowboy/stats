const Joi = require('joi')

const CampaignSchema = Joi.object().keys({
  name: Joi.string().min(4).required().label('name is required and must be at least four characters long'),
  created_at: Joi.date()
})

module.exports = CampaignSchema
