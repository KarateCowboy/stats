const uuid = require('uuid')
const common = require('./api/common')

const removeOldCompleted = async (client) => {
  console.log("removing old completed jobs")
  await client.query(`DELETE from dtl.remote_jobs WHERE status = 'complete' AND status_ts < current_timestamp - '10 minutes'::interval`, [])
}

const retrieve = async (client, id) => {
  return (await client.query('SELECT * FROM dtl.remote_jobs WHERE id = $1', [id])).rows[0]
}

const remove = async (client, id) => {
  await client.query('DELETE FROM dtl.remote_jobs WHERE id = $1', [id])
}

const complete = async (client, id, results) => {
  await client.query(`UPDATE dtl.remote_jobs SET results = $1, status = 'complete', status_ts = current_timestamp WHERE id = $2`, [results, id])
}

const error = async (client, id, results) => {
  await client.query(`UPDATE dtl.remote_jobs SET results = $1, status = 'error', status_ts = current_timestamp WHERE id = $2`, [results, id])
}

const start = async (client, id) => {
  await client.query(`UPDATE dtl.remote_jobs SET status = 'processing', status_ts = current_timestamp WHERE id = $1`, [id])
}

const create = async (client, jobName, params) => {
  const id = uuid()
  await client.query('insert into dtl.remote_jobs ( id, job, params ) values ($1, $2, $3)',
    [id, jobName, JSON.stringify(params)])
  return id
}

const CACHE_INTERVAL = process.env.CACHE_INTERVAL || '1 minute'
const checkForCachedResult = async (client, jobName, params) => {
  const result = await client.query(`SELECT id FROM dtl.remote_jobs WHERE job = $1 AND params::jsonb = $2::jsonb AND status = 'complete' AND status_ts > current_timestamp - '${CACHE_INTERVAL}'::interval ORDER BY status_ts DESC LIMIT 1`, [jobName, params])
  if (result.rowCount > 0) {
    console.log(`${result.rows[0].id}: ${jobName} - using cached result`)
    return result.rows[0].id
  }
  return null
}

const initialize = async (client, channel, jobName, params) => {
  let id
  id = await checkForCachedResult(client, jobName, params)
  if (id) return id

  // create a remote job record
  id = await create(client, jobName, params)
  // create a amqp message for the job
  await channel.sendToQueue(
    'jobs',
    Buffer.from(JSON.stringify({ id }), 'utf8')
  )
  return id
}

const jobHandler = (client, ch, jobName) => {
  return async (request, h) => {
    try {
      let jobId = await initialize(
        client,
        ch,
        jobName,
        common.retrieveCommonParametersObject(request)
      )
      return { id: jobId }
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = {
  initialize,
  retrieve,
  complete,
  create,
  start,
  removeOldCompleted,
  error,
  jobHandler
}
