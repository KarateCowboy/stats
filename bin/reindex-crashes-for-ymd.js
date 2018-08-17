#!/usr/bin/env node

const pg = require('pg')
const amqp = require('amqplib')

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const main = async (startYMD, endYMD) => {
  console.log(`Reindexing crashes between ${startYMD} and ${endYMD}`)
  try {
    const db = await pg.connect(process.env.DATABASE_URL)
    console.log(`Connecting to RabbitMQ at ${process.env.MQ_URL}`)
    const rabbitmq = await amqp.connect(process.env.MQ_URL)
    const channel = await rabbitmq.createChannel()
    const crashes = (await db.query("SELECT id FROM dtl.crashes WHERE contents->>'year_month_day' >= $1 and contents->>'year_month_day' <= $2", [startYMD, endYMD])).rows.map((r) => { return { id: r.id } })
    console.log(`Reindexing ${crashes.length} crashes`)
    let idx = 0
    for (let crash of crashes) {
      idx += 1
      let results = channel.sendToQueue(
        'crash-indexing',
        Buffer.from(JSON.stringify(crash)), {
          mandatory: true,
          persistent: true
        })
      if (!results) {
        console.log(`Queue full, sleeping ${idx}`)
        await sleep(2000)
      }
    }
    console.log('done')
    channel.close()
    rabbitmq.close()
    db.end()
  } catch (e) {
    console.log(e.toString())
  }
}

let args = require('yargs')
  .demand(['start', 'end'])
  .argv

main(args.start, args.end)
