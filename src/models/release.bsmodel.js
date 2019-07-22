/* global db */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Joi = require('joi')
const Schema = require('./validators/release')
module.exports = function (knex) {
  const BaseModel = require('./base_model')(knex)

  class Release extends BaseModel {
    $beforeInsert () {
      if (this.isHybridFormat()) {
        this.brave_version = this.hybridBraveVersion()
        this.uses_hybrid_format = true
      }
    }

    hybridBraveVersion () {
      return '0.' + this.chromiumVersion.match(/[0-9]{2,2}\.[0-9]+$/)[0]
    }

    get schema () {
      return Schema
    }

    static get tableName () {
      return 'dtl.releases'
    }

    static get relationMappings () {
      return {
        crashes: {
          relation: BaseModel.ManyToManyRelation,
          modelClass: db.Crash,
          join: {
            from: 'dtl.releases.id',
            through: {
              from: 'dtl.release_crashes.release_id',
              to: 'dtl.release_crashes.crash_id'
            },
            to: 'dtl.crashes.id'
          }
        },
        usageSummaries: {
          relation: BaseModel.HasManyRelation,
          modelClass: db.UsageSummary,
          join: {
            from: 'dtl.releases.brave_version',
            to: 'dw.fc_usage.version'
          }
        }
      }
    }

    get braveVersion () {
      return this.brave_version
    }

    set braveVersion (bv) {
      this.brave_version = bv
    }

    get chromiumVersion () {
      return this.chromium_version
    }

    set chromiumVersion (cv) {
      this.chromium_version = cv
    }

    get usesHybridFormat () {
      return this.uses_hybrid_format
    }

    set usesHybridFormat (bv) {
      this.uses_hybrid_format = bv
    }

    isHybridFormat () {
      if (this.chromiumVersion.match(/^[0-9]+\.[0-9]+\.[0-9]{2,2}\.[0-9]+$/)) {
        return true
      } else {
        return false
      }
    }

    static async createFromCrashVersions () {
      const releases = await this.query().select()
      const crashes = await db.Crash.query().select()
        .whereNotIn(`contents->>'ver'`, releases.map(r => r.chromiumVersion))
      await this.query().insert(crashes.map((c) => { return { chromium_version: c.contents['ver'] } }))
    }
  }

  return Release
}
