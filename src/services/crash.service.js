class CrashExpirationService {
  constructor(){
    const ElasticSearch = require('elasticsearch')
    this.elasticClient = new ElasticSearch.Client({
          host: process.env.ES_URL,
          log: process.env.ES_LOG_LEVEL
        })
  }
  async expire (crash = null) {
    if (crash.id === undefined || crash.id === null) {
      throw new Error('The crash provided must have an id')
    }

    await knex('dtl.crashes').where('id', crash.id).delete()
    await knex('dtl.crashes_archive').where('id', crash.id).delete()
    this.elasticClient.delete({ id: crash.id, type: 'crash', index: 'crashes'})
  }

}

module.exports = CrashExpirationService