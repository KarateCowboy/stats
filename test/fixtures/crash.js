/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const _ = require('lodash')
const { ObjectID } = require('mongodb')
const ObjectionAdapter = require('factory-girl-objection-adapter')

const define = () => {
  factory.setAdapter(new ObjectionAdapter(), 'crash')

  factory.define('crash', db.Crash, {
    id: () => {
      let o = new ObjectID()
      return _.shuffle(o.toString()).join('').slice(0, 24).toLowerCase()
    },
    contents: {
      'ts': () => { return '14311029860' },
      '_id': '5cdb5b07342004001f6e6ea6',
      'pid': '15901',
      'ver': '67.67.33',
      'prod': 'Brave',
      'ptime': '141620562',
      'ptype': 'browser',
      'channel': () => { return _.sample(['dev', 'developer', 'nightly', 'unknown', 'beta', 'stable']) },
      'mongoId': () => { return new ObjectID() },
      '_version': '0.22.669',
      'crash_id': '720e95802303ba27',
      'metadata': {
        'cpu': 'amd64',
        'cpu_count': '1',
        'signature': 'brave',
        'cpu_family': 'family 6 model 142 stepping 9',
        'crash_reason': 'DUMP_REQUESTED',
        'crash_thread': '0',
        'crash_address': '0x3f1a0c2',
        'operating_system': 'Linux',
        'operating_system_name': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64',
        'operating_system_version': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64'
      },
      'platform': () => { return _.sample(['linux', 'Win64', 'win32', 'darwin', 'Win32', 'OS X', 'unknown']) },
      'gpu-devid': '0x5916',
      'gpu-psver': '1.30',
      'gpu-venid': '0x8086',
      'gpu-vsver': '1.30',
      'url-chunk': '',
      'gpu-driver': '18.2.8',
      'top-origin': '',
      'lsb-release': 'Unknown',
      'gpu-gl-vendor': 'Intel Open Source Technology Center',
      'year_month_day': () => { return moment().subtract(2, 'days').format('YYYY-MM-DD') },
      'gpu-gl-renderer': 'Mesa DRI Intel(R) HD Graphics 620 (Kaby Lake GT2) ',
      'javascript-info__1': '{"stack":"TypeError: downloadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/reso',
      'javascript-info__2': 'urces/app.asar/app/browser/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/us',
      'javascript-info__3': 'r/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/u',
      'javascript-info__4': 'sr/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:48:26)\\n    at updateDownloadState (/usr/lib/brave/resource',
      'javascript-info__5': 's/app.asar/app/filtering.js:548:3)\\n    at DownloadItem.<anonymous> (/usr/lib/brave/resources/app.asar/app/filtering.js:591:7)\\',
      'javascript-info__6': 'n    at emitTwo (events.js:106:13)\\n    at DownloadItem.emit (events.js:194:7)","message":"Uncaught Exception:\\nTypeError: down',
      'javascript-info__7': 'loadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/resources/app.asar/app/browse',
      'javascript-info__8': 'r/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/usr/lib/brave/resources/app',
      'javascript-info__9': '.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/usr/lib/brave/resources/ap',
      'requested_site_url': 'https://fantasyanime.com/squaresoft/ct.htm',
      'killed_process_origin_lock': '',
      'total-discardable-memory-allocated': '8388608'
    },

    ts: () => { return new Date() }
  })

  factory.extend('crash', 'linux-crash', {
    contents: {
      'ts': () => { return '14311029860' },
      '_id': '5cdb5b07342004001f6e6ea6',
      'pid': '15901',
      'ver': () => { return `0.${_.random(50, 99)}.${_.random(10, 99)}.${_.random(10, 99)}` },
      'prod': 'Brave',
      'ptime': '141620562',
      'ptype': 'browser',
      'channel': () => { return _.sample(['dev', 'developer', 'nightly', 'unknown', 'beta', 'stable']) },
      'mongoId': () => { return new ObjectID() },
      '_version': '0.22.669',
      'crash_id': '720e95802303ba27',
      'metadata': {
        'cpu': 'amd64',
        'cpu_count': '1',
        'signature': 'brave',
        'cpu_family': 'family 6 model 142 stepping 9',
        'crash_reason': 'DUMP_REQUESTED',
        'crash_thread': '0',
        'crash_address': '0x3f1a0c2',
        'operating_system': 'Linux',
        'operating_system_name': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64',
        'operating_system_version': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64'
      },
      'platform': 'linux',
      'gpu-devid': '0x5916',
      'gpu-psver': '1.30',
      'gpu-venid': '0x8086',
      'gpu-vsver': '1.30',
      'url-chunk': '',
      'gpu-driver': '18.2.8',
      'top-origin': '',
      'lsb-release': 'Unknown',
      'gpu-gl-vendor': 'Intel Open Source Technology Center',
      'year_month_day': () => { return moment().subtract(2, 'days').format('YYYY-MM-DD') },
      'gpu-gl-renderer': 'Mesa DRI Intel(R) HD Graphics 620 (Kaby Lake GT2) ',
      'javascript-info__1': '{"stack":"TypeError: downloadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/reso',
      'javascript-info__2': 'urces/app.asar/app/browser/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/us',
      'javascript-info__3': 'r/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/u',
      'javascript-info__4': 'sr/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:48:26)\\n    at updateDownloadState (/usr/lib/brave/resource',
      'javascript-info__5': 's/app.asar/app/filtering.js:548:3)\\n    at DownloadItem.<anonymous> (/usr/lib/brave/resources/app.asar/app/filtering.js:591:7)\\',
      'javascript-info__6': 'n    at emitTwo (events.js:106:13)\\n    at DownloadItem.emit (events.js:194:7)","message":"Uncaught Exception:\\nTypeError: down',
      'javascript-info__7': 'loadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/resources/app.asar/app/browse',
      'javascript-info__8': 'r/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/usr/lib/brave/resources/app',
      'javascript-info__9': '.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/usr/lib/brave/resources/ap',
      'requested_site_url': 'https://fantasyanime.com/squaresoft/ct.htm',
      'killed_process_origin_lock': '',
      'total-discardable-memory-allocated': '8388608'
    }

  })
  factory.extend('crash', 'win64-crash', {
    contents: {
      'ts': () => { return '14311029860' },
      '_id': '5cdb5b07342004001f6e6ea6',
      'pid': '15901',
      'ver': '67.67.33.11',
      'prod': 'Brave',
      'ptime': '141620562',
      'ptype': 'browser',
      'channel': () => { return _.sample(['dev', 'developer', 'nightly', 'unknown', 'beta', 'stable']) },
      'mongoId': () => { return new ObjectID() },
      '_version': '0.22.669',
      'crash_id': '720e95802303ba27',
      'metadata': {
        'cpu': 'amd64',
        'cpu_count': '1',
        'signature': 'brave',
        'cpu_family': 'family 6 model 142 stepping 9',
        'crash_reason': 'DUMP_REQUESTED',
        'crash_thread': '0',
        'crash_address': '0x3f1a0c2',
        'operating_system': 'Linux',
        'operating_system_name': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64',
        'operating_system_version': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64'
      },
      'platform': 'Win64',
      'gpu-devid': '0x5916',
      'gpu-psver': '1.30',
      'gpu-venid': '0x8086',
      'gpu-vsver': '1.30',
      'url-chunk': '',
      'gpu-driver': '18.2.8',
      'top-origin': '',
      'lsb-release': 'Unknown',
      'gpu-gl-vendor': 'Intel Open Source Technology Center',
      'year_month_day': () => { return moment().subtract(2, 'days').format('YYYY-MM-DD') },
      'gpu-gl-renderer': 'Mesa DRI Intel(R) HD Graphics 620 (Kaby Lake GT2) ',
      'javascript-info__1': '{"stack":"TypeError: downloadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/reso',
      'javascript-info__2': 'urces/app.asar/app/browser/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/us',
      'javascript-info__3': 'r/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/u',
      'javascript-info__4': 'sr/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:48:26)\\n    at updateDownloadState (/usr/lib/brave/resource',
      'javascript-info__5': 's/app.asar/app/filtering.js:548:3)\\n    at DownloadItem.<anonymous> (/usr/lib/brave/resources/app.asar/app/filtering.js:591:7)\\',
      'javascript-info__6': 'n    at emitTwo (events.js:106:13)\\n    at DownloadItem.emit (events.js:194:7)","message":"Uncaught Exception:\\nTypeError: down',
      'javascript-info__7': 'loadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/resources/app.asar/app/browse',
      'javascript-info__8': 'r/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/usr/lib/brave/resources/app',
      'javascript-info__9': '.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/usr/lib/brave/resources/ap',
      'requested_site_url': 'https://fantasyanime.com/squaresoft/ct.htm',
      'killed_process_origin_lock': '',
      'total-discardable-memory-allocated': '8388608'
    }
  })
  factory.extend('crash', 'osx-crash', {
    contents: {
      'ts': () => { return '14311029860' },
      '_id': '5cdb5b07342004001f6e6ea6',
      'pid': '15901',
      'ver': '67.67.33.11',
      'prod': 'Brave',
      'ptime': '141620562',
      'ptype': 'browser',
      'channel': () => { return _.sample(['dev', 'developer', 'nightly', 'unknown', 'beta', 'stable']) },
      'mongoId': () => { return new ObjectID() },
      '_version': '0.22.669',
      'crash_id': '720e95802303ba27',
      'metadata': {
        'cpu': 'amd64',
        'cpu_count': '1',
        'signature': 'brave',
        'cpu_family': 'family 6 model 142 stepping 9',
        'crash_reason': 'DUMP_REQUESTED',
        'crash_thread': '0',
        'crash_address': '0x3f1a0c2',
        'operating_system': 'OS X',
        'operating_system_name': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64',
        'operating_system_version': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64'
      },
      'platform': 'OS X',
      'gpu-devid': '0x5916',
      'gpu-psver': '1.30',
      'gpu-venid': '0x8086',
      'gpu-vsver': '1.30',
      'url-chunk': '',
      'gpu-driver': '18.2.8',
      'top-origin': '',
      'lsb-release': 'Unknown',
      'gpu-gl-vendor': 'Intel Open Source Technology Center',
      'year_month_day': () => { return moment().subtract(2, 'days').format('YYYY-MM-DD') },
      'gpu-gl-renderer': 'Mesa DRI Intel(R) HD Graphics 620 (Kaby Lake GT2) ',
      'javascript-info__1': '{"stack":"TypeError: downloadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/reso',
      'javascript-info__2': 'urces/app.asar/app/browser/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/us',
      'javascript-info__3': 'r/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/u',
      'javascript-info__4': 'sr/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:48:26)\\n    at updateDownloadState (/usr/lib/brave/resource',
      'javascript-info__5': 's/app.asar/app/filtering.js:548:3)\\n    at DownloadItem.<anonymous> (/usr/lib/brave/resources/app.asar/app/filtering.js:591:7)\\',
      'javascript-info__6': 'n    at emitTwo (events.js:106:13)\\n    at DownloadItem.emit (events.js:194:7)","message":"Uncaught Exception:\\nTypeError: down',
      'javascript-info__7': 'loadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/resources/app.asar/app/browse',
      'javascript-info__8': 'r/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/usr/lib/brave/resources/app',
      'javascript-info__9': '.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/usr/lib/brave/resources/ap',
      'requested_site_url': 'https://fantasyanime.com/squaresoft/ct.htm',
      'killed_process_origin_lock': '',
      'total-discardable-memory-allocated': '8388608'
    }
  })
  factory.extend('crash', 'win32-crash', {
    contents: {
      'ts': () => { return '14311029860' },
      '_id': '5cdb5b07342004001f6e6ea6',
      'pid': '15901',
      'ver': '67.67.33.11',
      'prod': 'Brave',
      'ptime': '141620562',
      'ptype': 'browser',
      'channel': () => { return _.sample(['dev', 'developer', 'nightly', 'unknown', 'beta', 'stable']) },
      'mongoId': () => { return new ObjectID() },
      '_version': '0.22.669',
      'crash_id': '720e95802303ba27',
      'metadata': {
        'cpu': 'x86',
        'cpu_count': '1',
        'signature': 'brave',
        'cpu_family': 'family 6 model 142 stepping 9',
        'crash_reason': 'DUMP_REQUESTED',
        'crash_thread': '0',
        'crash_address': '0x3f1a0c2',
        'operating_system': 'Windows',
        'operating_system_name': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64',
        'operating_system_version': '0.0.0 Linux 4.15.0-48-generic #51-Ubuntu SMP Wed Apr 3 08:28:49 UTC 2019 x86_64'
      },
      'platform': 'Win32',
      'gpu-devid': '0x5916',
      'gpu-psver': '1.30',
      'gpu-venid': '0x8086',
      'gpu-vsver': '1.30',
      'url-chunk': '',
      'gpu-driver': '18.2.8',
      'top-origin': '',
      'lsb-release': 'Unknown',
      'gpu-gl-vendor': 'Intel Open Source Technology Center',
      'year_month_day': () => { return moment().subtract(2, 'days').format('YYYY-MM-DD') },
      'gpu-gl-renderer': 'Mesa DRI Intel(R) HD Graphics 620 (Kaby Lake GT2) ',
      'javascript-info__1': '{"stack":"TypeError: downloadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/reso',
      'javascript-info__2': 'urces/app.asar/app/browser/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/us',
      'javascript-info__3': 'r/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/u',
      'javascript-info__4': 'sr/lib/brave/resources/app.asar/app/browser/electronDownloadItem.js:48:26)\\n    at updateDownloadState (/usr/lib/brave/resource',
      'javascript-info__5': 's/app.asar/app/filtering.js:548:3)\\n    at DownloadItem.<anonymous> (/usr/lib/brave/resources/app.asar/app/filtering.js:591:7)\\',
      'javascript-info__6': 'n    at emitTwo (events.js:106:13)\\n    at DownloadItem.emit (events.js:194:7)","message":"Uncaught Exception:\\nTypeError: down',
      'javascript-info__7': 'loadMap[downloadId].getReceivedBytes is not a function\\n    at Object.keys.reduce (/usr/lib/brave/resources/app.asar/app/browse',
      'javascript-info__8': 'r/electronDownloadItem.js:20:46)\\n    at Array.reduce (<anonymous>)\\n    at progressDownloadItems (/usr/lib/brave/resources/app',
      'javascript-info__9': '.asar/app/browser/electronDownloadItem.js:19:50)\\n    at module.exports.updateElectronDownloadItem (/usr/lib/brave/resources/ap',
      'requested_site_url': 'https://fantasyanime.com/squaresoft/ct.htm',
      'killed_process_origin_lock': '',
      'total-discardable-memory-allocated': '8388608'
    }
  })
}

module.exports.define = define
