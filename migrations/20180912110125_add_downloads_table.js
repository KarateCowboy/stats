exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').createTable('downloads', (table) => {
    table.increments()
    table.string('ipAddress')
    table.string('sha', 66)
    table.string('type').defaultTo('brave-download')
    table.datetime('timestamp')
    table.string('code', 16)
    table.string('requestPath')
    table.integer('requestResponseCode')
    table.string('domain')
    table.string('platform')
    table.string('key' )
    table.timestamps(true, true)
    table.unique(['key', 'code'])
    table.index('platform')
  })
}

exports.down = async function (knex, Promise) {
  const exists = await knex.schema.withSchema('dw').hasTable('downloads')
  if (exists) {
    await knex.schema.withSchema('dw').dropTable('downloads')
  }
}
