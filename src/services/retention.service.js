const {Util} = require('../models/util')
const moment = require('moment')
const _ = require('underscore')

module.exports = class RetentionService {
  constructor () {
    this.table = 'dw.fc_retention_woi'
    this.platforms = ['ios', 'androidbrowser', 'linux', 'winia32', 'winx64', 'osx', 'linux-bc', 'osx-bc', 'winx64-bc']
  }

  async missing () {
    let missing = {}
    const last_ninety = Util.last_ninety_days().map((d) => { return d.format('YYYY-MM-DD')})
    for (let platform of this.platforms) {
      const ymd = Util.ninety_days_ago().format('YYYY-MM-DD')
      let existing_ymds = await knex('dw.fc_retention_woi').where('platform', platform)
        .where('ymd', '>=', ymd)
        .distinct('ymd')
        .select()
      existing_ymds = existing_ymds.map((o) => moment(o.ymd).format('YYYY-MM-DD'))
      missing[platform] = _.difference(last_ninety, existing_ymds)
    }
    return missing
  }
}
