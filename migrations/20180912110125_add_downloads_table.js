exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').createTable('downloads', (table) => {
    table.increments()
    table.string('ipAddress')
    table.string('sha', 66)
    table.string('type').defaultTo('brave-download')
    table.datetime('timestamp')
    table.string('idCode', 16)
    table.string('requestPath')
    table.integer('requestResponseCode')
    table.string('domain')
    table.string('platform')
    table.timestamps(true, true)
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').dropTable('downloads')
}
