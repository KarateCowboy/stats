#!/usr/bin/env node
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */


const commander = require('commander')
const moment = require('moment')
const mongoc = require('../src/mongoc')
const reporter = require('../src/reporter')
const path = require('path')

const AndroidUsageDayService = require('../src/services/android-usage-day.service')
const IosUsageDayService = require('../src/services/ios-usage-day.service')
const MuonUsageDayService = require('../src/services/muon-usage-day.service')
const CoreUsageDayService = require('../src/services/core-usage-day.service')

commander.option('-d --days [num]', 'Days to go back in reporting', 90)
  .option('-a, --android')
  .option('-c, --core')
  .option('-i, --ios')
  .option('-f, --force')
  .option('-m, --muon').parse(process.argv)

let jobName = path.basename(__filename)
let runInfo = reporter.startup(jobName)

const run = async () => {
  let service
  if (commander.android) {
    service = new AndroidUsageDayService()
  } else if (commander.ios) {
    service = new IosUsageDayService()
  } else if (commander.muon) {
    service = new MuonUsageDayService()
  } else if (commander.core) {
    service = new CoreUsageDayService()
  } else {
  }
  const woi = moment().subtract(Number(commander.days), 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD')
  try {
    global.mongo_client = await mongoc.setupConnection()
    const result = await service.retention_spread(woi)
    console.dir(result, {colors: true})
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
  process.exit(0)
}

run()
