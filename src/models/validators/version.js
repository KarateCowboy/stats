const Joi = require('joi')

const VersionSchema = Joi.object().keys({
  id: Joi.number().integer(),
  num: Joi.string().regex(/^([\d]+\.[\d]+\.[\d]+)|[a-z0-9]{40,40}$/),
  created_at: Joi.date(),
  updated_at: Joi.date()
})

module.exports = VersionSchema
