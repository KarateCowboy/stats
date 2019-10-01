exports.up = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', async (table) => {
    table.index(['version', 'has_valid_version'])
  })
}

exports.down = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', async (table) => {
    table.dropIndex(['version', 'has_valid_version'])
  })
}
