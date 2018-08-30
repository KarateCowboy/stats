MongoClient = require('mongodb').MongoClient

const aggregate_id = (usage, collection_name) => {
  platform = collection_name === 'android_usage' ? 'androidbrowser' : usage.platform
  return {
    ymd: usage.year_month_day,
    platform: platform,
    version: usage.version,
    channel: usage.channel,
    woi: usage.woi,
    ref: usage.ref || 'none',
    first_time: usage.first
  }
}

const run = async (collection_name, day) => {
  let aggregate_collection = `${collection_name}_aggregate_woi`
  global.mongo_client = await MongoClient.connect(process.env.MLAB_URI)
  const usage_params = {
    daily: true,
    year_month_day: day,
    version: {
      $not: /\([A-Za-z0-9]+\)$/
    },
    aggregated_at: {
      $exists: false
    }
  }
  let usages
  try {
    usages = await mongo_client.collection(collection_name).find(usage_params, {timeout: false})
  } catch (e) {
    console.log(`problem finding usages for ${day}`)
    console.log(e.message)
    process.send('error')
    process.exit()
  }
  let batch = []
  let sum = 0
  try {
    while (await usages.hasNext()) {
      let usage, has_next
      try {
        usage = await usages.next()
        has_next = await usages.hasNext()
      } catch (e) {
        console.log(`error checking next or getting next usage`)
        console.log(e.message)
      }
      batch.push(usage)
      if (batch.length === 1 || has_next === false) {
        await Promise.all(batch.map(async (usage) => {
          const usage_aggregate_id = aggregate_id(usage, collection_name)
          try {
            await mongo_client.collection(aggregate_collection).update({
              _id: usage_aggregate_id
            }, {
              $addToSet: {
                usages: usage._id
              },
              $inc: {
                total: 1
              }
            }, {
              upsert: true,
              timeout: false
            })
            await mongo_client.collection(collection_name).update({
              _id: usage._id
            }, {
              $set: {
                aggregated_at: Date.now()
              },

            }, {
              timeout: false
            })
            process.send('tick')
          } catch (e) {
            console.log(`problem aggregating a usage`)
            console.log(e.message)
          }
        }))
        sum += 1
        batch = []
      }
    }
    process.send('success')
  } catch (e) {
    console.log(`problem with the work for ${day}`)
    console.log(e.message)

  }
}

process.on('message', async (run_data) => {
  await run(run_data.collection_name, run_data.date)
  process.exit()
})