exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('downloads', (table) => {
    table.dropUnique('key')
    table.unique(['key', 'code'])
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').createTable('downloads', (table) => {
    table.dropUnique(['key', 'code'])
    table.unique('key')
  })
}
