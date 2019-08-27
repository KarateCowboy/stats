const uuid = require('uuid')

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

const initialize = async (client, channel, jobName, params) => {
  // create a remote job record
  const id = await create(client, jobName, params)
  // create a amqp message for the job
  await channel.sendToQueue(
    'jobs',
    Buffer.from(JSON.stringify({ id }), 'utf8')
  )
  return id
}

module.exports = {
  initialize,
  retrieve,
  complete,
  create,
  start,
  removeOldCompleted,
  error
}
