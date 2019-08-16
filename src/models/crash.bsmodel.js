/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global db */

const Joi = require('joi')
const Schema = require('./validators/crash')
const _ = require('lodash')
const { ref } = require('objection')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Crash extends BaseModel {
    get schema () {
      return Schema
    }

    async writeToSearchIndex (elasticClient) {
      try {
        const result = await elasticClient.index({
          index: 'crashes',
          type: 'crash',
          id: this.id,
          body: this.toJSON()
        })
      } catch (e) {
        console.log(`Error: could not write crash ${this.id} to index`)
        console.log(e)
        throw e
      }
    }

    async writeToAws (S3, bucket) {
      try {
        await S3.putObject({
          Bucket: bucket,
          Key: this.id,
          Body: JSON.stringify(this.toJSON())
        }).promise()
        await S3.putObject({
          Bucket: bucket,
          Key: `${this.id}.symbolized.txt`,
          Body: JSON.stringify(this.toJSON())
        }).promise()
        console.log(`Wrote crash ${this.id} to bucket ${bucket}`)
      } catch (e) {
        console.log(e)
        console.log(e.message)
        throw e
      }
    }

    static get jsonSchema () {
      return {
        id: { type: 'string' },
        ts: { type: 'date' },
        contents: { type: 'object' }
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
        'linux-bc': ['linux'],
        'linux': ['linux'],
        'winx64-bc': ['Win64'],
        'winia32': ['Win32', 'win32'],
        'winia32-bc': ['Win32', 'win32'],
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

    get canonPlatform () {
      return Crash.reverseMapPlatformFilters([this.contents.platform]).pop()
    }

    get version () {
      return this.contents.ver
    }

    static get relationMappings () {
      return {
        release: {
          relation: BaseModel.BelongsToOneRelation,
          modelClass: db.Release,
          join: {
            from: ref('dtl.crashes.contents:ver').castText(),
            to: 'dtl.releases.chromium_version'
          }
        }
      }
    }
  }

  return Crash
}
