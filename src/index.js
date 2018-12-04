/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

let path = require('path')
let _ = require('underscore')

let Hapi = require('hapi')
let Inert = require('inert')

let ui = require('./ui')

// API Endpoints
let jobs = require('./api/jobs')
let stats = require('./api/stats')
let crashes = require('./api/crashes')
let search = require('./api/search')
let eyeshade = require('./api/eyeshade')
let bat_eyeshade = require('./api/bat_eyeshade')
let publishers = require('./api/publishers')
let meta = require('./api/meta')
const mongoose = require('mongoose')
let telemetry = require('./api/telemetry')
let referral = require('./api/referral')
let referral_codes = require('./api/referral_codes')
let numbers = require('./api/numbers')

let setGlobalHeader = require('hapi-set-header')

let profile = process.env.NODE_ENV || 'development'
let config = require('../config/config.' + profile + '.js')

let slack = require('./slack')
let npminfo = require(path.join(__dirname, '..', 'package'))
config.npminfo = _.pick(npminfo, 'name', 'version', 'description', 'author', 'license', 'bugs', 'homepage')
let server
// This is fired after all resources connected
module.exports.setup = async (connections) => {
  server = new Hapi.Server()
  const connection = await server.connection({
    host: config.host,
    port: config.port
  })
  await mongoose.connect(process.env.MLAB_URI)
  server.register(Inert, function () {})

  // Handle the boom response as well as all other requests (cache control for telemetry)
  setGlobalHeader(server, 'Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0')
  setGlobalHeader(server, 'Pragma', 'no-cache')
  setGlobalHeader(server, 'Expires', 0)

  connection.listener.once('clientError', function (e) {
    console.error(e)
  })

  // Setup the APIs
  _.each([stats, jobs, crashes, search, eyeshade, bat_eyeshade, publishers, meta, numbers, telemetry, referral, referral_codes], (api) => { api.setup(server, connections.pg, connections.mg) })

  // Setup the UI for the dashboard
  ui.setup(server, connections.pg)
  // slack.setup(server, config)
  return server
}
module.exports.kickoff = async () => {
  return new Promise((resolve, reject) => {
    return server.start((err) => {
      if (err) {
        reject(err)
      } else {
        return resolve(() => {
          slack.notify({text: require('os').hostname() + ' ' + npminfo.name + '@' + npminfo.version + ' started'})
        })
      }
    })
  })
}

module.exports.shutdown = async () => {
  return new Promise((resolve, reject) => {
    server.stop((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
