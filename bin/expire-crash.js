#!/usr/bin/node

const Script = require('./script')
const CrashExpirationService = require('../src/services/crash.service')
const commander = require('commander')

class ExpireCrash extends Script {
  async run(){
    await this.setup()
    commander.option('-i, --id [id]', '24 char id of the crash to delete').parse(process.argv)
    const service = new CrashExpirationService()
    await service.expire({ id: commander.id })

    await this.shutdown()
  }
}

const script = new ExpireCrash()
script.run()

