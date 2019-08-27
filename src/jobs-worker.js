#!/usr/bin/env node

const messaging = require('./messaging')
const pg = require('pg')
const remote = require('./remote-job')

let client, connection, ch, msg, id, jobStatus

const main = async () => {
  try {
    client = await pg.connect(process.env.DATABASE_URL)
    connection = await messaging.connect()
    ch = await messaging.createChannel('jobs')
    await ch.consume('jobs', async (msg) => {
      id = JSON.parse(msg.content).id
      jobStatus = await remote.retrieve(client, id)
      await require(`./jobs/${jobStatus.job}`)(client, jobStatus)
      ch.ack(msg)
    })
  } catch (e) {
   console.log(e)
  }
}

process.on('SIGINT', async () => {
  try {
    await client.end()
  } catch (e) {
    console.log(e)
  } finally {
    process.exit(0)
  }
})

main()
