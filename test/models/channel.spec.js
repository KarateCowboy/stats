const _ = require('lodash')
const Channel = require('../../src/models/channel.model')()
const moment = require('moment')
const Util = require('../../src/models/util').Util
require('../test_helper')

describe('Channel', async function () {
  describe('schema', async function () {
    specify(' name: {type: String},', async function () {
      const channel = new Channel()
      let thrown = false
      try{
        await channel.save() 
      }catch(e){
        thrown = true
      }
      expect(thrown).to.equal(true)
    })
  })
})
