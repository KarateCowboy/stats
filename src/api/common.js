/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const _ = require('underscore')
const moment = require('moment')
const r = require('request')

const allPlatforms = ['osx', 'winx64', 'winia32', 'ios', 'android', 'unknown', 'linux', 'darwin', 'androidbrowser', 'winx64-bc', 'linux-bc', 'osx-bc']
exports.allPlatforms = allPlatforms

const allChannels = ['dev', 'beta', 'stable', 'nightly', 'developer', 'unknown']
exports.allChannels = allChannels

exports.channelPostgresArray = (channelFilter) => {
  let channels = _.filter((channelFilter || '').split(','), (channel) => channel !== '')
  if (!channels.length) {
    return allChannels
  } else {
    return channels
  }
}

exports.platformPostgresArray = (platformFilter) => {
  let platforms = _.filter((platformFilter || '').split(','), (platform) => platform !== '')

  // handle legacy unknown = linux equality
  if (platforms.indexOf('linux') > -1) {
    platforms.push('unknown')
  }

  if (!platforms.length) {
    return allPlatforms
  } else {
    return platforms
  }
}

exports.formatPGRow = (row) => {
  if (row.count) {
    row.count = parseInt(row.count, 10)
    if (row.first_count) {
      row.first_count = parseInt(row.first_count, 10)
    }
    if (row.all_count) {
      row.all_count = parseInt(row.all_count, 10)
    }
  }
  if (row.daily_percentage) {
    row.daily_percentage = parseFloat(row.daily_percentage)
  }
  if (row.ts) {
    row.ago = moment(row.ts).add(moment().utcOffset(), 'minutes').fromNow()
  }
  if (row.platform === 'unknown') {
    row.platform = 'linux'
  }
  return row
}

const todayISODate = () => {
  let d = new Date()
  return [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-')
}

const todayISOMonth = () => {
  let d = new Date()
  return [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), '01'].join('-')
}

exports.potentiallyFilterToday = (rows, showToday) => {
  if (!showToday) {
    var today = todayISODate()
    rows = _.filter(rows, (row) => {
      return row.ymd < today
    })
  }
  return rows
}

exports.potentiallyFilterThisMonth = (rows, showMonth) => {
  if (!showMonth) {
    var thisMonth = todayISOMonth()
    rows = _.filter(rows, (row) => {
      return row.ymd < thisMonth
    })
  }
  return rows
}

module.exports.round = function (v, n) {
  n = n || 2
  var mult = Math.pow(10, n)
  return parseInt(v * mult) / mult
}

/*
  Build a response handler using a default set of success and param generators

  client - Postgres client connection
  query  - SQL to execute
  successHandler - function( results, request) -> Null
  function to handle sending results to the reply function
  paramsBuilder - function(request) -> Array
  function to build a set of SQL params for query
*/
module.exports.buildQueryReponseHandler = function (client, query, successHandler, paramsBuilder) {
  paramsBuilder = paramsBuilder || ((request) => { return [] })
  successHandler = successHandler || ((results) => { return (results.rows) })
  return async (request, h) => {
    const params = paramsBuilder(request)
    const results = await client.query(query, params)
    return successHandler(results, request)
  }
}

module.exports.convertPlatformLabels = function (row) {
  if (row.platform === 'android') row.platform = 'Link Bubble'
  if (row.platform === 'androidbrowser') row.platform = 'Android Browser'
  return row
}

module.exports.prequest = function (url) {
  return new Promise((resolve, reject) => {
    r(url, (err, results, body) => {
      if (err) return reject(err)
      else return resolve(body)
    })
  })
}

module.exports.requestWithAuth = (url, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      headers: {
        Authorization: 'Bearer ' + token
      }
    }
    r(options, (err, results, body) => {
      if (err) return reject(err)
      else return resolve(body)
    })
  })
}

exports.retrieveCommonParameters = (request) => {
  let days = parseInt(request.query.days || 7, 10) + ' days'
  let platforms = exports.platformPostgresArray(request.query.platformFilter)
  let channels = exports.channelPostgresArray(request.query.channelFilter)
  let ref = request.query.ref === '' ? null : _.compact(request.query.ref.split(','))
  let wois = request.query.wois === '' ? null : _.compact(request.query.wois.split(','))
  let countryCodes = !request.query.countryCodes || request.query.countryCodes === '' ? null : _.compact(request.query.countryCodes.split(','))

  return [days, platforms, channels, ref, wois, countryCodes]
}

exports.retrieveCommonParametersObject = (request) => {
  let days = parseInt(request.query.days || 7, 10) + ' days'
  let platforms = exports.platformPostgresArray(request.query.platformFilter)
  let channels = exports.channelPostgresArray(request.query.channelFilter)
  let ref = request.query.ref === '' ? null : _.compact(request.query.ref.split(','))
  let wois = request.query.wois === '' ? null : _.compact(request.query.wois.split(','))
  let countryCodes = !request.query.countryCodes || request.query.countryCodes === '' ? null : _.compact(request.query.countryCodes.split(','))
  let source = request.query.source || 'all'
  let showToday = request.query.showToday === 'true'

  return { days, platforms, channels, ref, wois, countryCodes, source, showToday }
}

exports.retrieveCommonP3AParameters = (request) => {
  let days = parseInt(request.query.days || 7, 10) + ' days'
  let platforms = exports.platformPostgresArray(request.query.platformFilter)
  let channels = exports.channelPostgresArray(request.query.channelFilter)
  let ref = request.query.ref === '' ? null : _.compact(request.query.ref.split(','))
  let wois = request.query.wois === '' ? null : _.compact(request.query.wois.split(','))
  let metricIds = request.query.metricIds === '' ? null : _.compact(request.query.metricIds.split(','))
  let countryCodes = request.query.countryCodes === '' ? null : _.compact(request.query.countryCodes.split(','))

  return { days, platforms, channels, ref, wois, metricIds, countryCodes }
}
