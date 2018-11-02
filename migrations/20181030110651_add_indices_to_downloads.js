exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('downloads', (table) => {
    table.index('platform')
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').alterTable('downloads', (table) => {
    table.dropIndex('platform')
  })
}

