/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const {ObjectID} = require('mongodb')
const {Util} = require('../../src/models/util')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class Download {
    async save () {
      await knex('dw.downloads').insert({
        ip_address: this.ip_address,
        sha: this.sha,
        timestamp: this.timestamp,
        id_code: this.id_code,
        request_path: this.request_path,
        rest_operation: this.rest_operation,
        request_response_code: this.request_response_code,
        domain: this.domain,
        platform: this.platform
      })
    }

    async destroy () {
      await knex('dw.downloads').delete({
        id: this.id
      })
    }
    timestamp_format_string () {
     return  'DD/MMM/YYYY:HH:mm:ss ZZ'
    }

  }

  factory.define('download', Download, {
    ip_address: () => { return [Util.random_int(256), Util.random_int(256), Util.random_int(256), Util.random_int(256)].map(n => n.toString()).join('.') },
    sha: () => {
      const id = new ObjectID().toString()
      return (id + id + id).substring(0, 64)
    },
    type: 'brave-download',
    timestamp: () => moment().format('DD/MMMM/YY:HH:mm:ss ZZ'),
    id_code: () => { return new ObjectID().toString().toUpperCase().substring(0, 16) },
    request_path: 'multi-channel/releases/dev/0.19.123/osx/Brave-0.19.123.zip',
    rest_operation: 'REST.GET.OBJECT',
    request_response_code: 200,
    domain: 'htts://brave.com/downloads',
    platform: () => {
      let platforms = [
        'osx',
        'winx64',
        'winia32',
        'linux',
        'ios',
        'android',
        'androidbrowser',
        'winx64-bc',
        'winia32-bc',
        'linux-bc'
      ]
      return platforms[Util.random_int(10 - 1)]
    }
  }
  )
}

module.exports.define = define
