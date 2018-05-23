/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert')
const MongoClient = require('mongodb').MongoClient

const mongoURL = process.env.MLAB_URI
if (!mongoURL) throw new Error('MLAB_URI must be set in environment')

module.exports.setup = function (cb) {
  console.log('Connecting to Mongo at ' + mongoURL)
  MongoClient.connect(mongoURL, (err, connection) => {
    assert.equal(null, err)
    cb(err, connection)
  })
}

module.exports.setupConnection = function () {
  console.log('Connecting to Mongo at ' + mongoURL)
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongoURL, (err, connection) => {
      if (err) return reject(err)
      else resolve(connection)
    })
  })
}
