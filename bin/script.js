/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const _ = require('lodash')
const mongoose = require('mongoose')
const commander = require('commander')
const yargs = require('yargs')
const Sequelize = require('sequelize')
const DbUtil = require('../src/models')
const moment = require('moment')
const pgc = require('../src/pgc')
const mongoc = require('../src/mongoc')
const Knex = require('knex')
const reporter = require('../src/reporter')
const path = require('path')
const common = require('../src/common')
const logger = common.logger

module.exports = class Script {
  constructor (jobname) {
    this.jobName = jobname || path.basename(__filename)
    this.runInfo = reporter.startup(this.jobName)
    this.commander = commander
    this.moment = moment
    this.prequest = require('../src/api/common').prequest
    this.yargs = yargs
    this.common = common
    this.logger = common.logger
  }

  async setup () {
    try {
      global.sequelize = new Sequelize(process.env.DATABASE_URL, {logging: false})
      await mongoose.connect(process.env.MLAB_URI)
      global.db = new DbUtil(process.env.DATABASE_URL)
      global.pg_client = await pgc.setupConnection()
      global.mongo_client = await mongoc.setupConnection()
      global.knex = await Knex({client: 'pg', connection: process.env.DATABASE_URL})
      await global.db.loadModels()
    } catch (e) {
      console.log('Problem connecting to AWS or DB')
      console.log(e.message)
      process.exit(1)
    }
  }

  async run () {
    _.noop()
  }

  async shutdown () {
    try {
      this.runInfo.duration = ((new Date()).getTime() - this.runInfo.ts) / 1000
      console.log(`'${this.runInfo.id}' complete - ${this.runInfo.duration} seconds`)
      await pg_client.query('INSERT INTO dtl.runinfo ( id, duration ) VALUES ( $1, $2 )', [this.runInfo.id, this.runInfo.duration])
      await pg_client.query('DELETE FROM dtl.runinfo WHERE ts < current_timestamp - \'14 days\'::interval AND id = $1', [this.runInfo.id])
    } catch (e) {
      console.log('error: ' + e)
    }
    await global.pg_client.end()
    await global.mongo_client.close()
    await global.knex.destroy()
    process.exit()

  }
}
