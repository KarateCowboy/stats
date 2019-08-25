const EventEmitter = require('events')

class RemoteJob extends EventEmitter {
  constructor (url, interval=2000, timeout=120000) {
    super()
    this.url = url
    this.interval = interval
    this.timeout = timeout
    this.lastStatus = 'unknown'
  }

  async cancel() {
    // todo - cancel the job on the server
    console.log(`cancelling`)
    clearInterval(this.interval)
  }

  async start () {
    this.emit('start')
    const job = await $.ajax(this.url)
    this.emit('started', {
      id: job.id
    })

    this.interval = setInterval(async () => {
      const jobStatus = await $.get(`/api/1/remote_jobs/${job.id}`)
      if (this.lastStatus !== jobStatus.status) {
        this.lastStatus = jobStatus.status
        this.emit('status-change', jobStatus.status)
      }
      if (jobStatus.status === 'complete') {
        clearInterval(this.interval)
        this.interval = null
        this.emit('complete', jobStatus.results)
        currentRemoteJob = null
      }
    }, this.interval)

    setTimeout(() => {
      if (this.interval) clearInterval(this.interval)
    }, this.timeout)
  }
}

let currentRemoteJob

const submit = async (url, interval=2000, timeout=120000) => {
  if (currentRemoteJob) await currentRemoteJob.cancel()
  currentRemoteJob = new RemoteJob(url, interval, timeout)
  await currentRemoteJob.start()
  return currentRemoteJob
}

module.exports = {
  submit
}
