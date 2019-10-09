const Helper = codeceptjs.helper

class StartServer extends Helper {

  // before/after hooks
  async _before () {
    console.log('I RAN YOUR CUSTOM BEFORE HELPER')
    require('../test_helper')
    await test_helper.setup()
    await test_helper.truncate()
    global.server = require(process.cwd() + '/src/index')
    await server.setup({ pg: global.pg_client, mg: global.mongo_client })
    try {
      await server.kickoff()
    } catch (e) {
      console.log('server failed to run')
      console.log(e.message)
      throw e
    }
  }

  async _after () {
    await server.shutdown()
    await test_helper.tear_down()
  }

  // add custom methods here
  // If you need to access other helpers
  // use: this.helpers['helperName']

}

module.exports = StartServer
