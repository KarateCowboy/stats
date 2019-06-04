/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const amqp = require('amqplib/callback_api')

// RabbitMQ connection parameters
const MQ_URL = process.env.MQ_URL || process.env.AMQP_URL || 'amqp://localhost:5672'
const MQ_QUEUE = process.env.MQ_QUEUE || 'crashes'

// Connect to messaging system and return a communication channel
exports.setup = function (cb) {
  console.log('Connecting to AMQP server at ' + MQ_URL)
  amqp.connect(MQ_URL, (err, conn) => {
    if (err != null) {
      throw new Error(err)
    }
    console.log('AMQP connection established')
    var on_open = (err, ch) => {
      console.log(`AMQP connected to channel ${MQ_QUEUE}`)
      if (err != null) {
        throw new Error(err)
      }
      // install the queue name on the channel object
      ch.queueName = MQ_QUEUE
      ch.prefetch(1)
      ch.assertQueue(MQ_QUEUE, {durable: true})
      cb(err, ch)
    }
    conn.createChannel(on_open)
  })
}

exports.send = function (msg, ch) {
  console.log(`Message sent to '${MQ_QUEUE}'`)
  ch.sendToQueue(
    MQ_QUEUE,
    Buffer(JSON.stringify(msg)),
    {persistent: true}
  )
}

exports.sendToVersionQueue = function (msg, ch, version) {
  const queueName = MQ_QUEUE + ':' + version
  console.log(`Message sent to '${queueName}'`)
  ch.sendToQueue(
    queueName,
    Buffer(JSON.stringify(msg)),
    {persistent: true}
  )
}

class PromiseQueue {
  async setup (queueName) {
    this.queueName = queueName
    try {
      const rabbit = require('amqplib')
      this.conn = await rabbit.connect(MQ_URL)
      this.channel = await this.conn.createChannel()
      this.channel.queueName = this.queueName
      this.channel.prefetch(1)
      this.channel.assertQueue(this.queueName, {durable: true})
      return this.channel
    } catch (e) {
      console.log(e)
      console.log(e.message)
      throw e
    }
  }

  async send (message) {
    console.log(`Message sent to '${this.queueName}'`)
    await this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)), {persistent: true})
  }

  async sendToVersionQueue () {
    const queueName = this.queueName + ':' + version
    await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {persistent: true})
    console.log(`Message sent to '${queueName}'`)
  }

}

exports.PromiseQueue = PromiseQueue

