#!/usr/bin/node

const Script = require('./script')
const CrashExpirationService = require('../src/services/crash.service')
const commander = require('commander')

class ExpireCrash extends Script {
  async run () {
    await this.setup()
    commander.option('-i, --id [id]', '24 char id of the crash to delete')
      .option('-q, --queue', 'Queue with RabbitMQ rather than attempt immediately via script')
      .parse(process.argv)
    const service = new CrashExpirationService()
    if (commander.queue) {
      await service.queueExpiration({ id: commander.id })
    } else {
      await service.expire({ id: commander.id })
    }

    await this.shutdown()
  }
}

const script = new ExpireCrash()
script.run()

