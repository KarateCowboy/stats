/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const Sequelize = require('sequelize')
const fs = require('fs-extra')
const path = require('path')
const _ = require('underscore')

class DbUtil {
  constructor (pgConnString, mongoConnString) {
    this.pgConnectionString = pgConnString
    this.mongoConnectionString = mongoConnString
    this.basename = path.basename(module.filename)
    this.connect()

    this.dirFiles = fs.readdirSync(__dirname)
    this.dirFiles = this.pgModelsFilter(this.dirFiles)
  }

  loadModels(){
    for (let file of this.dirFiles) {
      let modelName = file.replace('.pgmodel.js', '')
      let firstLetter = modelName.slice(0, 1).toUpperCase()
      modelName = modelName.replace(/^[a-z]{1,1}/, firstLetter)
      const modelPath = path.join(__dirname, file)
      const model = this.sequelize.import(modelPath)
      this[model.name] = model
      if (typeof this[model.name].associate === 'function')
        this[model.name].associate(this)
    }
  }

  connect () {
    const options = {
      ssl: true,
      logging: false
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
}

module.exports = DbUtil
