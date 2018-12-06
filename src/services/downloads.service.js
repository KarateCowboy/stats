const _ = require('underscore')
const moment = require('moment')
const ProgressBar = require('smooth-progress')

module.exports = class DownloadsService {
  constructor (downloads_bucket, S3, ymd) {
    this.download_logs_bucket = downloads_bucket
    this.S3 = S3
    this.objectList = []
    this.ymd = ymd
    this.timestamp_format_string = 'DD/MMM/YYYY:HH:mm:ss ZZ'
  }

  async getLogList (pagination_key) {
    const params = {
      Bucket: 'aa', //download_logs_bucket,
      MaxKeys: 2000000000,
      Prefix: '2018'
    }
    if (!!pagination_key) {
      params.Key = pagination_key
    }
    const data = await this.S3.listObjects(params).promise() //, data, (err, data) => { if (err) return reject() resolve(data.Contents)
    this.current_list = data.Contents
    return data
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
      try {
        const file = await this.S3.getObject({Bucket: 'brave-download-logs', Key: object.Key}).promise()
        let contents = file.Body.toString()
        let data = this.prepData(contents)
        for (let line of data) {
          const attributes = this.parse(line)
          attributes.key = object.Key
          await db.Download.create(attributes)
        }
      } catch (e) {
        if (e.message.includes('downloads_key_code_unique') === false) {
          console.log(`Error: ${e.message}`)
          console.log(`    objectKey: ${object.Key}`)
        }
      }
      bar.tick(1)
    }
  }

  parse (line) {
    const result = {}
    result.sha = this.parseSha(line)
    result.type = line.substring(65, 80).trim()
    result.timestamp = this.parseTimestamp(line)
    result.ipAddress = this.parseIpAddress(line)
    result.code = this.parseIdCode(line)
    result.requestPath = this.parseRequestPath(line)
    result.requestResponseCode = this.parseResponseCode(line)
    result.domain = this.parseDomain(line)
    result.platform = this.parsePlatform(line)
    return result
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

  prepData (fileData) {
    return _.compact(fileData.split(/[\r\n]{1,1}/))
  }

  parseResponseCode (line) {
    const reg = new RegExp(/\s[0-9]{3,3}\s/)
    if (!line.match(reg)) {
      return null
    } else {
      return Number(line.match(reg)[0].replace(/\s/g, ''))
    }
  }

  parseIdCode (line) {
    const reg = new RegExp(/[A-Z0-9]{16,}/)
    if (!line.match(reg)) {
      return null
    } else {
      return line.match(reg)[0]
    }
  }

  parseIpAddress (line) {
    const reg = new RegExp(/([\d]{1,3}\.){3,}[\d]{1,3}/)
    if (!line.match(reg)) {
      return null
    }
    return line.match(reg)[0]
  }

  parseTimestamp (line) {
    const reg = new RegExp(/[\d]{2,}\/[A-Za-z]{1,}\/[\d]{4,4}(:[\d]{2,})+\s{1,1}[+|-]{1,}[\d]{4,}/)
    if (!line.match(reg)) {
      return null
    }
    return moment(line.match(reg)[0], 'DD/MMM/YYYY:HH:mm:ss ZZ').format()
  }

  parseSha (line) {
    const reg = new RegExp(/[0-9a-z]{62,66}/)
    if (!line.match(reg)) {
      return null
    } else {
      return line.match(reg)[0]
    }
  }

  parsePlatform (line) {
    const reg = new RegExp(/(linux32)|(linux64)|(osx)|(winx64)|(winia32)|(debian64)|(linux-bc)|(winx64-bc)/)
    if (line.match(reg)) {
      return line.match(reg)[0].replace(/(linux64)|(debian64)/, 'linux')
    } else {
      return 'unknown'
    }
  }

  parseDomain (line) {
    if (line.match(/\b(http?s:\/\/)[a-z0-9\.\/]+\b/)) {
      return line.match(/\b(http?s:\/\/)[a-z0-9\.\/]+\b/)[0]
    } else {
      return null
    }
  }

  parseRequestPath (line) {
    const findings = line.match(/(GET )[\/a-zA-Z0-9-\?_=\&\.]+/)
    if (!findings) {
      return null
    }
    return findings[0].replace('GET ', '')
  }

  async create (attributes) {
    return (await db.Download.create(attributes))
  }

  async find (params = {}) {
    return (await db.Download.findAll(params))
  }
}
