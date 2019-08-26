const amqp = require('amqplib')

let connection
let channel
let MESSAGING_URL = process.env.AMQP_URL || process.env.CLOUDAMQP_URL || 'amqp://localhost:5672'

const connect = async () => {
  try {
    connection = await amqp.connect(MESSAGING_URL)
    return connection
  } catch (e) {
    console.log(e)
    return null
  }
}

const createChannel = async (queueName) => {
  let channel = await connection.createChannel()
  await channel.assertQueue(queueName, { durable: true })
  channel.prefetch(1)
  return channel
}

module.exports = {
  connect,
  createChannel
}
