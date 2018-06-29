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
require('./fixtures/fc_retention_woi').define()
require('./fixtures/android_usage').define()
require('./fixtures/ios_usage_record').define()
require('./fixtures/android_usage_aggregate_week').define()
require('./fixtures/usage_aggregate_woi').define()
require('./fixtures/link_bubble_usage').define()
require('./fixtures/desktop_usage').define()
require('./fixtures/referral_code').define()

class TestHelper {
  constructor () {
    if (!process.env.TEST_DATABASE_URL) {
      throw Error('Please set TEST_DATABASE_URL')
    }
    this.testDatabaseUrl = process.env.TEST_DATABASE_URL
    if (!process.env.TEST_MLAB_URI) {
      throw Error('Please set TEST_MLAB_URI')
    }
    this.testMongoUri = process.env.TEST_MLAB_URI
    global.MONGO_URI = process.env.TEST_MLAB_URI
    global.expect = require('chai').expect

    this.mongo_collections = [
      'usage',
      'referral_codes',
      'usage_aggregate_woi',
      'android_usage',
      'android_usage_aggregate_woi',
      'ios_usage'
    ]
    this.postgres_tables = {
      'dw': [
        'fc_retention_woi'
      ]
    }
    this.materialized_views = {
      'dw': [
        'fc_retention_week_mv',
        'fc_retention_month_mv'
      ]
    }

  }

  async setup () {
    this.mongo_client = await mongo.connect(this.testMongoUri)
    global.mongo_client = this.mongo_client
    await mongoose.connect(this.testMongoUri)
    global.pg_client = await pg.connect(this.testDatabaseUrl)
    this.knex = await Knex({client: 'pg', connection: this.testDatabaseUrl})
    global.knex = this.knex
    this.factory = factory
    global.factory = factory
  }

  async truncate () {
    for (let collection of this.mongo_collections) {
      if ((await mongo_client.collection(collection))) {
        await mongo_client.collection(collection).remove({})
      } else {
        await mongo_client.createCollection(collection)
      }
    }
    for (let schema in this.postgres_tables) {
      for (let relation in this.postgres_tables[schema]) {
        await knex(`${schema}.${this.postgres_tables[schema][relation]}`).truncate()
      }
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
    await global.pg_client.end()
    await global.knex.destroy()
    await mongoose.connection.close()
  }

}

module.exports.TestHelper = TestHelper
