const define = (knex) => {
  const bookshelf = require('bookshelf')(knex)
  const UsageSummary = bookshelf.Model.extend({
    tableName: 'dw.fc_usage',
    hasTimestamps: true 
  })
  return UsageSummary
}

module.exports = define
