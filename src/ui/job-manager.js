const EventEmitter = require('events')

let currentJob

const submit = async (url, interval=2000, timeout=120000) => {
  if (currentJob) currentJob.cancel()
}

module.exports = {
  submit
}
