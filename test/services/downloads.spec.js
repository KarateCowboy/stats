require('../test_helper')
const AWS = require('aws-sdk')
const DownloadsService = require('../../src/services/downloads.service')
const FS = require('fs-extra')
const _ = require('underscore')
const moment = require('moment')

let service
describe('Downloads Service', async function () {
  describe('#get_log_list', async function () {
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

      //execution
      service = new DownloadsService(mockS3)

    })
    it('reads the list of logs from amazon S3', async function () {
      const list_of_downloads = await service.get_log_list()
      //validation
      expect(list_of_downloads.Contents).to.have.property('length', 1000)

    })
    it('sets the current_list property', async function () {
      await service.get_log_list()
      expect(service.current_list).to.have.property('length', 1000)
    })
    it('takes an optional key on which to start', async function () {
      await service.get_log_list('ABC')
      expect(service.current_list).to.have.property('length', 500)
    })
  })
  describe('#build_from_list', async function () {
    it('builds multiple downloads from an S3 list', async function () {

    })
  })
  describe('#parse', async function () {
    it('returns a hash with correctly parsed values', async function () {
      const line = `608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954 brave-download [01/Jan/2018:02:02:03 +0000] 157.52.69.34 - 922A0961750A507F REST.GET.OBJECT multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe "GET /multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe HTTP/1.1" 304 - 236855360 - 136855360 9 9 - "https://brave.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299" -`
      const attributes = service.parse(line)
      expect(attributes).to.have.property('sha', '608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954')
      expect(attributes).to.have.property('type', 'brave-download')
      expect(attributes).to.have.property('timestamp', '01/Jan/2018:02:02:03 +0000')
      expect(attributes).to.have.property('ip_address', '157.52.69.34')
      expect(attributes).to.have.property('id_code', '922A0961750A507F')
      expect(attributes).to.have.property('rest_operation', 'REST.GET.OBJECT')
      expect(attributes).to.have.property('request_path', 'multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe')
      expect(attributes).to.have.property('request_string', 'GET /multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe HTTP/1.1')
      expect(attributes).to.have.property('request_response_code', 304)
      expect(attributes).to.have.property('domain', 'https://brave.com')

    })
  })
  describe('create', async function () {
    let download_attrs, download, downloads
    beforeEach(async function () {
      service = new DownloadsService()
      download_attrs = await factory.attrs('download')
      download = await service.create(download_attrs)
      downloads = await knex('dw.downloads').select('*')
    })
    it('creates a download entry', async function () {
      expect(downloads).to.have.property('length', 1)
    })
    specify('sha', async function () {
      expect(downloads[0]).to.have.property('sha', download_attrs.sha)
      expect(downloads[0].sha).to.have.property('length', 64)
    })
    specify('type', async function () {
      download_attrs = await factory.attrs('download')
      delete download_attrs.type
      download = await service.create(download_attrs)
      downloads = await knex('dw.downloads').select('*')
      expect(downloads[0]).to.have.property('type', 'brave-download')
      expect(downloads[1]).to.have.property('type', 'brave-download')
    })
    specify('timestamp', async function () {
      expect(downloads[0]).to.have.property('timestamp', download_attrs.timestamp)
    })
    specify('ip_address', async function () {
      expect(downloads[0]).to.have.property('ip_address', download_attrs.ip_address)
    })
    specify('id_code', async function () {
      expect(downloads[0]).to.have.property('id_code', download_attrs.id_code)
    })
    specify('rest_operation', async function () {
      expect(downloads[0]).to.have.property('rest_operation', download_attrs.rest_operation)
    })
    specify('request_path', async function () {
      expect(downloads[0]).to.have.property('request_path', download_attrs.request_path)
    })
    specify('request_string', async function () {
      expect(downloads[0]).to.have.property('request_string', download_attrs.request_string)
    })
    specify('request_response_code', async function () {
      expect(downloads[0]).to.have.property('request_response_code', download_attrs.request_response_code)
    })
    specify('domain', async function () {
      expect(downloads[0]).to.have.property('domain', download_attrs.domain)
    })
    specify('created_at', async function () {
      expect(downloads[0]).to.have.property('created_at')
    })
    specify('updated_at', async function () {
      expect(downloads[0]).to.have.property('updated_at')
    })
  })
  describe('#timestamp_format_string', async function () {
    it('meets the specified format', async function () {
      let correct_format = 'DD/MMMM/YY:HH:mm:ss ZZ'
      expect(moment().format(correct_format)).to.equal(moment().format(service.timestamp_format_string))
    })
  })
})
