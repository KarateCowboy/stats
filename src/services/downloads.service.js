const _ = require('underscore')
const ProgressBar = require('smooth-progress')
module.exports = class DownloadsService {
  constructor (downloads_bucket, S3, ymd, numbersApp) {
    this.download_logs_bucket = downloads_bucket
    this.S3 = S3
    this.objectList = []
    this.ymd = ymd
    this.numbersApp = numbersApp
  }

  async getObjectListForDay () {
    const params = {
      Bucket: this.download_logs_bucket,
      MaxKeys: 2000000000,
      Prefix: this.ymd,
    }
    let data = await this.S3.listObjects(params).promise()
    while (data.Contents.length > 0) {
      this.objectList = this.objectList.concat(data.Contents)
      params.Marker = _.last(data.Contents).Key
      data = await this.S3.listObjects(params).promise()
    }
    console.log('done getting objects for day')
  }
  async loadObjectsFromList () {
    const bar = ProgressBar({
      tmpl: `Loading ${this.objectList.length} ... :bar :percent :eta`,
      width: 25,
      total: this.objectList.length
    })
    for (let object of this.objectList) {
      try{
        const file = await  this.S3.getObject({Bucket: 'brave-download-logs', Key: object.Key}).promise()
        let contents = file.Body.toString()
        let data = this.prepData(contents)
        for(let line of data){
          await this.numbersApp.service('downloads').create({rawString: line, key: object.Key})
        }
      } catch (e) {
        if(e.message.includes("downloads_key_code_unique") === false) {
          console.log(`Error: ${e.message}`)
          console.log(`    objectKey: ${object.Key}`)
        }
      }
      bar.tick(1)
    }
  }

  async latestKeyForYmd (ymd) {
    const latest_key = knex('dw.downloads').whereRaw(`key LIKE '%${ymd}%' `).orderBy('created_at', 'desc').limit(1).toString()
    const result = await knex.raw(latest_key)
    if (result.rows.length === 1) {
      return result.rows[0].key
    } else {
      return undefined
    }
  }
  prepData(fileData){
    return _.compact(fileData.split(/[\r\n]{1,1}/))
  }
}
