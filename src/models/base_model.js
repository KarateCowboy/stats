const Joi = require('joi')
module.exports = function (knex) {
  const Model = require('objection').Model
  Model.knex(knex)
  // const bookshelf = require('bookshelf')(knex)


  class BaseModel extends Model {
    $beforeInsert() {
      const { error, value } = this.validate()
      if(error !== null){
        throw new Error(error.message)
      }
    }
    validate(){
      const json_format = this.toJSON()
      return Joi.validate(json_format, this.schema )
    }

  }

  return BaseModel
}

