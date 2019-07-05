/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Joi = require('joi')
const Schema = require('./validators/crash')
const _ = require('lodash')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Crash extends BaseModel {
    get schema () {
      return Schema
    }

    static get jsonSchema () {
      return {
        id: {type: 'string'},
        ts: {type: 'date'},
        contents: {type: 'object'}
      }
    }

    static get idColumn () {
      return 'id'
    }

    static get tableName () {
      return 'dtl.crashes'
    }

    static mapPlatformFilters (givenFilters) {
      let mappings = {
        'linux': ['linux'],
        'winx64-bc': ['Win64'],
        'winia32': ['Win32', 'win32'],
        'osx-bc': ['OS X', 'darwin'],
        'unknown': ['unknown']
      }
      let returnedFilters = givenFilters.reduce((acc, val) => {
        acc.push(mappings[val])
        return acc
      }, [])
      return _.compact(_.flatten(returnedFilters))
    }

    static reverseMapPlatformFilters (givenPlatforms) {
      let mappings = {
        'linux': 'linux',
        'Win64': 'winx64-bc',
        'Win32': 'winia32-bc',
        'win32': 'winia32-bc',
        'OS X': 'osx-bc',
        'darwin': 'osx-bc',
        'unknown': 'unknown'
      }
      return givenPlatforms.map(p => mappings[p])
    }

    static async totals () {
      return this.knex().select().from('dw.fc_crashes_dau_mv')
    }

    get canonPlatform () {
      return Crash.reverseMapPlatformFilters([this.contents.platform]).pop()
    }

    get version () {
      return this.contents._version
    }
  }

  return Crash
}
