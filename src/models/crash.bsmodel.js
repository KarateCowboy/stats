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
    static reverseMapPlatformFilters(givenPlatforms) {
      let mappings = {
        'linux': 'linux',
        'Win64' :'winx64-bc',
        'Win32': 'winia32' ,
        'win32':'winia32' ,
        'OS X' : 'osx-bc',
        'darwin': 'osx-bc',
        'unknown': 'unknown'
      }
      return givenPlatforms.map(p => mappings[p])
    }

    /*
  static get idColumn(){
    //return 'channel'
  }
  */
  }

  return Crash
}

