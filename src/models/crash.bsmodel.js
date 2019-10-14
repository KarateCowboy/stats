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
const semver = require('semver')
const moment = require('moment')

module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Crash extends BaseModel {
    get schema () {
      return Schema
    }

    async writeToSearchIndex (elasticClient) {
      try {
        await elasticClient.index({
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

    updateSearchFields () {
      if (_.isEmpty(this.contents)) return
      this._updatePlatform()
      this._updateVersionInfo()
      this._updateChannel()
      this._updateYmd()
      return {
        ymd: this.ymd,
        platform: this.platform,
        is_core: this.is_core,
        has_valid_version: this.has_valid_version,
        channel: this.channel,
        version: this.version
      }
    }

    _updateYmd () {
      this.ymd = moment(this.contents.year_month_day).format('YYYY-MM-DD')
    }

    _updatePlatform () {
      if (_.isEmpty(this.contents.platform)) {
        this.platform = 'unknown'
      } else if (this.contents.platform.match(/os\s?x/i) || this.contents.platform.match(/darwin/i)) {
        this.platform = 'osx-bc'
      } else if (this.contents.platform.match(/win\s?64/i)) {
        this.platform = 'winx64-bc'
      } else if (this.contents.platform.match(/linux/i)) {
        this.platform = 'linux-bc'
      } else if (this.contents.platform.match(/win\s?32/i)) {
        this.platform = 'winia32-bc'
      } else {
        this.platform = 'unknown'
      }
    }

    _updateVersionInfo () {
      const versionIsValid = semver.valid(this.contents.ver)
      if (versionIsValid) {
        this.has_valid_version = true
        const majorVersion = this.contents.ver.match(/^[0-9]+/)[0]
        if (parseInt(majorVersion) > 69) {
          this.is_core = true
        } else {
          this.is_core = false
        }
      } else {
        this.has_valid_version = false
        this.is_core = false
      }
      this.version = this.contents.ver
    }

    _updateChannel () {
      if (_.isEmpty(this.contents.channel)) {
        this.channel = 'release'
      } else {
        this.channel = this.contents.channel
      }
    }

    $beforeUpdate (opt, queryContext) {
      this.updateSearchFields()
      this.updated_at = moment()
    }

    $beforeInsert () {
      this.updateSearchFields()
    }

    static get relationMappings () {
      return {
        release: {
          relation: BaseModel.BelongsToOneRelation,
          modelClass: db.Release,
          join: {
            from: 'dtl.crashes.version',
            to: 'dtl.releases.chromium_version'
          }
        }
      }
    }
  }

  return Crash
}
