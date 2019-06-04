/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const PromiseQueue = require('../src/amqpc').PromiseQueue
const CrashExpirationService = require('./services/crash.service')
const throng = require('throng')
const Knex = require('knex')
const mini = require('../src/mini')

class CrashExpirationWorker {
  static async setup () {
    try {
      const amqp = new PromiseQueue()
      this.ch = await amqp.setup('crash-expiration')
    } catch (e) {
      console.log(e.message)
      throw e
    }
    console.log('All resources available.')
    console.log('Reading messages from AMQP')

    // Read messages from queue
    await this.ch.consume(this.ch.queueName, async (msg) => {
      const msgContents = JSON.parse(msg.content.toString())
      try {
        global.knex = await Knex({client: 'pg', connection: process.env.DATABASE_URL})
        console.log(`[${msgContents.id}] ******************** start ********************`)
        const crashExpirationService = new CrashExpirationService()
        await crashExpirationService.expire({id: msgContents.id})
        global.knex.destroy()
      } catch (e) {
        console.log('Error:')
        console.dir(e, {colors: true})
        console.log(e.message)
      }
      this.ch.ack(msg)
    }, {noAck: false})
  }
}

throng({
  workers: 1,
  master: () => { console.log('starting crash expiration workers')},
  start: (id) => {
    console.log(`Started worker ${id}`)

    process.on('SIGTERM', () => {
      console.log(`Worker ${id} exiting...`)
      console.log('(cleanup would happen here)')
      process.exit()
    })
    CrashExpirationWorker.setup()
  }
})
