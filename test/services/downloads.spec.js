require('../test_helper')
const fs = require('fs-extra')
const DownloadsService = require('../../src/services/downloads.service')
const FS = require('fs-extra')
const moment = require('moment')

describe('DownloadsService', async function () {
  describe('#preData', async function () {
    it('splits multiline files', async function () {
      const service = new DownloadsService()
      let fileData = await fs.readFile('./test/fixtures/download_log_exceptions.txt', 'utf8')
      const returnedRecords = service.prepData(fileData)
      expect(returnedRecords).to.have.property('length', 3)
    })
  })
  beforeEach(async function () {
    service = new DownloadsService()
  })
  describe('#getLogList', async function () {
    beforeEach(async function () {
      const file_input = await FS.readFile('./test/fixtures/S3_downloads_object_list.json')
      const sample_object = JSON.parse(file_input)

      const mockS3 = {
        listObjects: (options) => {
          return {
            promise: () => {
              if (options.Key) {
                const sample_object_clone = Object.assign({}, sample_object)
                sample_object.Contents = sample_object_clone.Contents.splice(500)
                return sample_object
              } else {
                return sample_object
              }
            }
          }
        }
      }
      service.S3 = mockS3
    })
    it('reads the list of logs from amazon S3', async function () {
      const list_of_downloads = await service.getLogList()
      // validation
      expect(list_of_downloads.Contents).to.have.property('length', 1000)
    })
    it('sets the current_list property', async function () {
      await service.getLogList()
      expect(service.current_list).to.have.property('length', 1000)
    })
    it('takes an optional key on which to start', async function () {
      await service.getLogList('ABC')
      expect(service.current_list).to.have.property('length', 500)
    })
  })
  describe.skip('#build_from_list', async function () {
    it('builds multiple downloads from an S3 list', async function () {

    })
  })
  describe('#parse', async function () {
    it('returns a hash with correctly parsed values', async function () {
      const line = `608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954 brave-download [01/Jan/2018:02:02:03 +0000] 157.52.69.34 - 922A0961750A507F REST.GET.OBJECT multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe "GET /multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe HTTP/1.1" 304 - 236855360 - 136855360 9 9 - "https://brave.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299" -`
      const attributes = service.parse(line)
      expect(attributes).to.have.property('sha', '608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954')
      expect(attributes).to.have.property('type', 'brave-download')
      expect(attributes).to.have.property('ipAddress', '157.52.69.34')
      expect(attributes).to.have.property('code', '922A0961750A507F')
      expect(attributes).to.not.have.property('rest_operation')
      expect(attributes).to.have.property('requestPath', '/multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe')
      expect(attributes).to.have.property('requestResponseCode', 304)
      expect(attributes).to.have.property('domain', 'https://brave.com')
      expect(attributes).to.have.property('platform', 'winx64')
    })
    it('converts the file timestamp to a format friendly to moment', async function () {
      const line = `608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954 brave-download [01/Jan/2018:02:02:03 +0000] 157.52.69.34 - 922A0961750A507F REST.GET.OBJECT multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe "GET /multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe HTTP/1.1" 304 - 236855360 - 136855360 9 9 - "https://brave.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299" -`
      const attributes = service.parse(line)
      const matching_time = moment('2018-01-01 02:02:03+0000')
      expect(attributes.timestamp).to.contain(matching_time.format())
    })
    it('works from file read to db write to db read', async () => {
      const line = `608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954 brave-download [01/Jan/2018:02:02:03 +0000] 157.52.69.34 - 922A0961750A507F REST.GET.OBJECT multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe "GET /multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe HTTP/1.1" 304 - 236855360 - 136855360 9 9 - "https://brave.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299" -`
      const attributes = service.parse(line)
      let download = await db.Download.create(attributes)
      download = await db.Download.findOne({_id: download._id})
      expect(download.sha).to.equal('608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954')
      expect(download.type).to.equal('brave-download')
      expect(download.ipAddress).to.equal('157.52.69.34')
      expect(download.code).to.equal('922A0961750A507F')
      expect(download.requestPath).to.equal('/multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe')
      expect(download.requestResponseCode).to.equal(304)
      expect(download.domain).to.equal('https://brave.com')
      expect(download.platform).to.equal('winx64')
    })
  })
  describe('create', async function () {
    let download_attrs, download, downloads
    beforeEach(async function () {
      download_attrs = await factory.attrs('download')
      download = await service.create(download_attrs)
      downloads = await service.find()
    })
    it('creates a download entry', async function () {
      expect(downloads).to.have.property('length', 1)
    })
    specify('sha', async function () {
      expect(downloads[0]).to.have.property('sha', download_attrs.sha)
      expect(downloads[0].sha).to.have.property('length', 64)
    })
    specify('platform', async function () {
      expect(downloads[0]).to.have.property('platform', download_attrs.platform)
    })
    specify('type', async function () {
      download_attrs = await factory.attrs('download')
      delete download_attrs.type
      download = await service.create(download_attrs)
      downloads = await service.find({})
      expect(downloads[0]).to.have.property('type', 'brave-download')
      expect(downloads[1]).to.have.property('type', 'brave-download')
    })
    specify('timestamp', async function () {
      expect(moment(downloads[0].timestamp).format()).to.equal(moment(download_attrs.timestamp, service.timestamp_format_string).format())
    })
    specify('ipAddress', async function () {
      expect(downloads[0]).to.have.property('ipAddress', download_attrs.ipAddress)
    })
  })
  describe('#timestamp_format_string', async function () {
    it('meets the specified format', async function () {
      let correct_format = 'DD/MMM/YYYY:HH:mm:ss ZZ'
      expect(moment().format(correct_format)).to.equal(moment().format(service.timestamp_format_string))
    })
  })
})
