'use strict'
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const faker = require('faker')
const moment = require('moment')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class Crash {
    async save () {
      await knex('dtl.crashes').insert(this.toJSON())
    }

    async destroy () {
      await knex('dtl.crashes')
    }
  }

  factory.define('crash', Crash, {
    id: () => { return faker.random.alphaNumeric(24).toUpperCase() },
    ts: () => { return moment().format('YYYY-MM-DD hh:mm:ss')},
    github_repo: null,
    contents: () => {
      return {
        'ts':
          1553194795756,
        '_id':
          '5c93df2b22f473001febc22f',
        'pid':
          '4005',
        'ver':
          'u\u0011��\x7F',
        'prod':
          'Brave',
        'ptime':
          '77009486',
        'ptype':
          'browser',
        'channel':
          'dev',
        'mongoId':
          '5c93df2b22f473001febc22f',
        '_version':
          '0.24.0',
        'crash_id':
          '8f1cf5d3fd2a6e43',
        'metadata':
          {
            'cpu':
              'amd64',
            'cpu_count':
              '4',
            'signature':
              'brave',
            'cpu_family':
              'family 6 model 42 stepping 7',
            'crash_reason':
              'DUMP_REQUESTED',
            'crash_thread':
              '0',
            'crash_address':
              '0x44cbe01',
            'operating_system':
              'Linux',
            'operating_system_name':
              '0.0.0 Linux 4.15.0-46-generic #49-Ubuntu SMP Wed Feb 6 09:33:07 UTC 2019 x86_64',
            'operating_system_version':
              '0.0.0 Linux 4.15.0-46-generic #49-Ubuntu SMP Wed Feb 6 09:33:07 UTC 2019 x86_64'
          }
        ,
        'platform':
          'unknown',
        'gpu-devid':
          '0x0102',
        'gpu-psver':
          '1.30',
        'gpu-venid':
          '0x8086',
        'gpu-vsver':
          '1.30',
        'url-chunk':
          '',
        'gpu-driver':
          '18.2.2',
        'top-origin':
          '',
        'lsb-release':
          'Unknown',
        'muon-version':
          '8.1.6',
        'gpu-gl-vendor':
          'Intel Open Source Technology Center',
        'year_month_day':
          '2019-03-21',
        'gpu-gl-renderer':
          'Mesa DRI Intel(R) Sandybridge Desktop ',
        'javascript-info__1':
          '{"stack":"TypeError: downloadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/reso',
        'javascript-info__2':
          'urces/app.asar/app/browser/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/us',
        'javascript-info__3':
          'r/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/u',
        'javascript-info__4':
          'sr/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:48:26)\\n    at updateDownloadState (/usr/lib/brave/resource',
        'javascript-info__5':
          's/app.asar/app/filtering.js:633:3)\\n    at DownloadItem.<anonymous> (/usr/lib/brave/resources/app.asar/app/filtering.js:685:7)\\',
        'javascript-info__6':
          'n    at emitTwo (events.js:106:13)\\n    at DownloadItem.emit (events.js:194:7)","message":"Uncaught Exception:\\nTypeError: down',
        'javascript-info__7':
          'loadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/resources/app.asar/app/browse',
        'javascript-info__8':
          'r/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/usr/lib/brave/resources/app',
        'javascript-info__9':
          '.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/usr/lib/brave/resources/ap',
        'total-discardable-memory-allocated':
          '96174080'
      }
    },
    github_issue_number: null
  })
}

module.exports.define = define
