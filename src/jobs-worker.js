#!/usr/bin/env node

const messaging = require('./messaging')
const pg = require('pg')
const Knex = require('knex')
const Sequelize = require('sequelize')
const DbUtil = require('./models')
const remote = require('./remote-job')

let client, connection, ch, msg, id, jobStatus

const main = async () => {
  try {
    client = await pg.connect(process.env.DATABASE_URL)
    connection = await messaging.connect()
    ch = await messaging.createChannel('jobs')

    // support model globals
    global.sequelize = new Sequelize(process.env.DATABASE_URL)
    global.pg_client = client
    global.db = new DbUtil(process.env.DATABASE_URL)
    global.knex = await Knex({client: 'pg', connection: process.env.DATABASE_URL})
    await db.loadModels()

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
