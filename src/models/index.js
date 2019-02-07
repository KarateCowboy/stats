/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const Sequelize = require('sequelize')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

class DbUtil {
  constructor (pgConnString, mongoConnString) {
    this.pgConnectionString = pgConnString
    this.mongoConnectionString = mongoConnString
    this.basename = path.basename(module.filename)
    this.connect()

    this.dirFiles = fs.readdirSync(__dirname)
    this.pgFiles = this.pgModelsFilter(this.dirFiles)
    this.bsFiles = this.bsModelsFilter(this.dirFiles)
    this.models = []
  }

  loadModels () {
    for (let file of this.pgFiles) {
      let modelName = file.replace('.pgmodel.js', '')
      let firstLetter = modelName.slice(0, 1).toUpperCase()
      modelName = modelName.replace(/^[a-z]{1,1}/, firstLetter)
      const modelPath = path.join(__dirname, file)
      const model = this.sequelize.import(modelPath)
      this[model.name] = model
      this.models.push(model.name)
    }
    this.models.forEach((m) => {
      if (typeof m.associate === 'function') {
        m.associate()
      }
    })

    if (global.knex === undefined) {
      throw new Error('Global knex instance must be defined before loading Bookshelf ORM')
    }
    for (let file of this.bsFiles) {
      let modelName = _.camelCase(file.replace('.bsmodel.js', ''))
      let firstLetter = modelName.slice(0, 1).toUpperCase()
      modelName = modelName.replace(/^[a-z]{1,1}/, firstLetter)
      const modelPath = path.join(__dirname, file)
      this[modelName] = require(modelPath)(global.knex)
      this.models.push(modelName)
    }
  }

  connect () {
    const options = {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false
    }
    if (process.env.LOCAL === undefined) {
      options.dialectOptions = {
        ssl: true
      }
    }
    this.sequelize = new Sequelize(this.pgConnectionString, options)
  }

  pgModelsFilter (list) {
    return list.filter(file => {
      return file.indexOf('.') !== 0 &&
        file !== this.basename &&
        file.slice(-10) === 'pgmodel.js'
    })
  }

  bsModelsFilter (list) {
    return list.filter(file => {
      return file.indexOf('.') !== 0 &&
        file !== this.basename &&
        file.slice(-10) === 'bsmodel.js'
    })
  }
}

module.exports = DbUtil
