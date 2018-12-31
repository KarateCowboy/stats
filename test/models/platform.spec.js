const _ = require('lodash')
const Platform = require('../../src/models/platform.model')()
const moment = require('moment')
const Util = require('../../src/models/util').Util
require('../test_helper')

describe('Platform', async function () {
  describe('schema', async function () {
    specify(' name: {type: String},', async function () {
      const platform = new Platform()
      let thrown = false
      try{
        await platform.save() 
      }catch(e){
        thrown = true
      }
      expect(thrown).to.equal(true)
    })
    specify(' versions: { type: Array }', async function(){
        const platform = new Platform({ name: 'linux' })
        await platform.save() 
      expect(platform.versions).to.be.an('array')
    })
  })
})
