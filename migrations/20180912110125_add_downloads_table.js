exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').createTable('downloads', (table) => {
    table.increments()
    table.string('ip_address')
    table.string('sha', 64)
    table.string('type').defaultTo('brave-download')
    table.string('timestamp')
    table.string('id_code', 16)
    table.string('request_path')
    table.string('rest_operation')
    table.string('request_string')
    table.integer('request_response_code')
    table.string('domain')
    table.timestamps()
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').dropTable('downloads')
}
