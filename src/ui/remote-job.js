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
      this.emit('update', jobStatus)
      if (this.lastStatus !== jobStatus.status) {
        this.lastStatus = jobStatus.status
        this.emit('status-change', jobStatus)
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
  if (currentRemoteJob) {
    currentRemoteJob.removeAllListeners()
    await currentRemoteJob.cancel()
  }
  currentRemoteJob = new RemoteJob(url, interval, timeout)
  await currentRemoteJob.start()
  currentRemoteJob.on('update', (jobStatus) => {
    if ($("#remote-job-message").is(':hidden')) {
      setTimeout(() => { $("#remote-job-message").fadeIn(250) })
    }
    if (jobStatus.status === 'complete') {
      $("#remote-job-message").html('Complete')
      setTimeout(() => { $("#remote-job-message").fadeOut(750) }, 1000)
    } else if (jobStatus.status === 'error') {
      currentRemoteJob.cancel()
      $("#remote-job-message").html('Error ... ' + jobStatus.results.error)
    } else if (jobStatus.status === 'processing') {
      $("#remote-job-message").html('Processing ... ' + moment().diff(jobStatus.status_ts, 'seconds'))
    } else {
      $("#remote-job-message").html(jobStatus.status)
    }
  })
  return currentRemoteJob
}

module.exports = {
  submit
}
