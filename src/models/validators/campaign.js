const Joi = require('joi')

const CampaignSchema = Joi.object().keys({
  name: Joi.string().required().label('name is required'),
  created_at: Joi.date()
})

module.exports = CampaignSchema
