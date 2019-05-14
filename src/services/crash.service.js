const ElasticSearch = require('elasticsearch')
const AWS = require('aws-sdk')

class CrashExpirationService {
  constructor () {
    this.AWS = AWS
    this.elasticClient = new ElasticSearch.Client({
      host: process.env.ES_URL,
      log: process.env.ES_LOG_LEVEL
    })
    this.AWS.config.update({
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: 'us-west-2',
      sslEnabled: true
    })
    this.S3 = new this.AWS.S3({})
  }

  async expire (crash = null) {

    if (crash.id === undefined || crash.id === null) {
      throw new Error('The crash provided must have an id')
    }
    try {
      await this.S3.deleteObject({
        Bucket: process.env.S3_CRASH_BUCKET,
        Key: crash.id
      })
      await knex('dtl.crashes').where('id', crash.id).delete()
      await knex('dtl.crashes_archive').where('id', crash.id).delete()
      this.elasticClient.delete({id: crash.id, type: 'crash', index: 'crashes'})
    } catch (e) {
      console.log(`Error deleting crash with id ${crash.id}`)
      console.log(`   Message: ${e.message}`)
    }
  }

}

module.exports = CrashExpirationService