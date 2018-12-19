/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const pg = require('pg')
const mongo = require('mongodb')
const Knex = require('knex')
const factory = require('factory-girl').factory
const mongoose = require('mongoose')
const Sequelize = require('sequelize')
const DbUtil = require('../src/models')
require('./fixtures/fc_retention_woi').define()
require('./fixtures/android_usage').define()
require('./fixtures/ios_usage_record').define()
require('./fixtures/android_usage_aggregate_week').define()
require('./fixtures/usage_aggregate_woi').define()
require('./fixtures/link_bubble_usage').define()
require('./fixtures/referral_code').define()
require('./fixtures/core-usage').define()
require('./fixtures/usage').define()
require('./fixtures/core-usage-day').define()
require('./fixtures/muon-usage-day').define()
require('./fixtures/fc_usage_month').define()
require('./fixtures/fc_usage_month_exception').define()
require('./fixtures/wallets').define()
const fixtures = {
  fc_usage: require('./fixtures/fc_usage'),
  download: require('./fixtures/download')
}

class TestHelper {
  constructor () {
    process.env.TEST = 'true'
    if (!process.env.TEST_DATABASE_URL) {
      throw Error('Please set TEST_DATABASE_URL')
    }
    this.testDatabaseUrl = process.env.TEST_DATABASE_URL
    global.SQL_ORM_URL = process.env.TEST_DATABASE_URL
    global.sequelize = new Sequelize(SQL_ORM_URL, {logging: false})
    if (!process.env.TEST_MLAB_URI) {
      throw Error('Please set TEST_MLAB_URI')
    }
    this.testMongoUri = process.env.TEST_MLAB_URI
    global.MONGO_URI = process.env.TEST_MLAB_URI
    process.env.MLAB_URI = process.env.TEST_MLAB_URI
    global.expect = require('chai').expect
    global.sinon = require('sinon')

    this.mongo_collections = [
      'usage',
      'referral_codes',
      'usage_aggregate_woi',
      'android_usage',
      'android_usage_aggregate_woi',
      'ios_usage',
      'ios_usage_aggregate_woi',
      'brave_core_usage',
      'brave_core_usage_aggregate_woi'
    ]
    this.postgres_tables = {
      'dw': [
        'fc_retention_woi',
        'fc_usage_month',
        'downloads',
        'fc_usage_month_exceptions',
        'fc_usage',
        'fc_wallets'
      ]
    }
    this.materialized_views = {
      'dw': [
        'fc_retention_week_mv',
        'fc_retention_month_mv',
        'fc_usage_platform_mv'
      ]
    }
    if (process.env.LOADED_MOCHA_OPTS) {
      process.env.MOCHA = true
    }
  }

  async setup () {
    if (global.mongo_client === undefined) {
      global.mongo_client = await mongo.connect(this.testMongoUri)
      await mongoose.connect(this.testMongoUri)
    }
    if (!global.pg_client) {
      global.pg_client = await pg.connect(this.testDatabaseUrl)
      this.knex = await Knex({client: 'pg', connection: this.testDatabaseUrl})
      global.knex = this.knex
    }
    if (global.db === undefined) {
      global.db = new DbUtil(this.testDatabaseUrl)
      global.db.loadModels()
      Object.keys(fixtures).forEach(f => fixtures[f].define())
    }
    global.factory = factory
  }

  async truncate () {
    await Promise.all(this.mongo_collections.map(async (collection) => {
      if ((await mongo_client.collection(collection))) {
        await mongo_client.collection(collection).remove({})
      } else {
        await mongo_client.createCollection(collection)
      }
    }))
    for (let schema in this.postgres_tables) {
      let self = this
      await Promise.all(self.postgres_tables[schema].map(async (relation) => {
        if (!relation.toString().includes('undefined')) {
          const sql_string = `${schema}.${relation}`
          await knex(sql_string).truncate()
        }
      }))
    }
  }

  async refresh_views () {
    for (let schema in this.materialized_views) {
      for (let view in this.materialized_views[schema]) {
        await pg_client.query(`REFRESH MATERIALIZED VIEW ${schema}.${this.materialized_views[schema][view]}`)
      }
    }
  }

  async tear_down () {
    await global.mongo_client.close()
    global.mongo_client = null
    await global.pg_client.end()
    global.pg_client = null
    await global.knex.destroy()
    await mongoose.connection.close()
  }
}

module.exports = (function () {
  if (!global.test_helper) {
    global.test_helper = new TestHelper()

    if (process.env.MOCHA) {
      before(async function () {
        await global.test_helper.setup()
      })
      beforeEach(async function () {
        this.timeout(10000)
        await global.test_helper.truncate()
      })
      after(async function () {
        await global.test_helper.tear_down()
        setTimeout(function () {
          process.exit()
        }, 1000)
      })
    }
  }
}())
