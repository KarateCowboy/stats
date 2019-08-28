/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

let _ = require('underscore')
let fs = require('fs')
let path = require('path')

let Hapi = require('hapi')
let Inert = require('inert')
let blipp = require('blipp')
let messaging = require('./messaging')

let ui = require('./ui')
const mongoose = require('mongoose')

const controllers = fs.readdirSync(path.join(__dirname, 'api'), {})
  .filter((filename) => { return filename.match(/.js$/g) })
  .map((filename) => { return require(path.join(__dirname, './api', filename)) })

let setGlobalHeader = require('hapi-set-header')

let profile = process.env.NODE_ENV || 'development'
let config = require('../config/config.' + profile + '.js')

let server
module.exports.setup = async (connections) => {
  server = new Hapi.Server({
    host: config.host,
    port: config.port,
    routes: {
      security: {
        hsts: true
      }
    }
  })

  // setup jobs queue
  let connection = await messaging.connect()
  let channel = await messaging.createChannel('jobs')

  await mongoose.connect(process.env.MLAB_URI)
  await server.register(Inert)
  if (!process.env.TEST) {
    server.register(blipp)
    console.log('registering http -> https')
    server.register({ plugin: require('hapi-require-https'), options: {} })
  }

  // Setup the APIs
  _.each(controllers, (api) => {
    if (api.setup) api.setup(server, connections.pg, connections.mg, channel)
  })

  // Setup the UI for the dashboard
  ui.setup(server, connections.pg)

  return server
}

module.exports.kickoff = async () => {
  await server.start()
}

module.exports.shutdown = async () => {
  await server.stop()
}
