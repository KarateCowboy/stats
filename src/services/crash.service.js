class CrashExpirationService {
  async expire(crash= null){
    if(crash.id === undefined || crash.id === null){
      throw new Error('The crash provided must have an id')
    }

    await knex('dtl.crashes').where('id', crash.id).delete()

  }

}

module.exports = CrashExpirationService