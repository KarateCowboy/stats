require('../test_helper')
const fs = require('fs-extra')
const DownloadsService = require('../../src/services/downloads.service')

describe("DownloadsService", async function(){
  describe("#preData", async function(){
    it('splits multiline files', async function(){
      const service = new DownloadsService()
      let fileData = await fs.readFile('./test/fixtures/download_log_exceptions.txt','utf8')
      const returnedRecords = service.prepData(fileData)
      expect(returnedRecords).to.have.property('length',3)
    })
  })
})
