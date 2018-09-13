/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const FactoryGirl = require('factory-girl')
const factory = FactoryGirl.factory
const moment = require('moment')
const {ObjectID} = require('mongodb')
const { Util } = require('../../src/models/util')

const define = () => {
  factory.setAdapter(new FactoryGirl.ObjectAdapter())

  class Download {
    async save () {
      await knex('dw.downloads').insert({
        ip_address: this.ip_address
      })
    }

    async destroy () {
      await knex('dw.downloads').delete({
        id: this.id
      })
    }
  }

  factory.define('download', Download, {
      ip_address: () => { return [Util.random_int(256), Util.random_int(256), Util.random_int(256), Util.random_int(256)].map(n => n.toString()).join('.')},
      sha: () => {
        const id = new ObjectID().toString()
        return (id + id + id ).substring(0,64)
      },
      type: 'brave-download',
      timestamp: () => moment().format('DD/MMMM/YY:HH:mm:ss ZZ'),
      id_code: () => { return new ObjectID().toString().toUpperCase().substring(0,16)},
      request_url: 'multi-channel/releases/dev/0.19.123/osx/Brave-0.19.123.zip',
      rest_operation: 'REST.GET.OBJECT',
      request_string: 'GET /multi-channel/releases/dev/0.19.123/osx/Brave-0.19.123.zip HTTP/1.1',
      request_response_code: 200,
      junk_number_1: Util.random_int(9000),
      junk_number_2: () => Util.random_int(9000),
      junk_number_3: () => Util.random_int(9000),
      junk_number_4: () => Util.random_int(9000),
      browser_signature: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36" ,
      domain: "htts://brave.com/downloads"
    }
  )
}

module.exports.define = define
