exports.up = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', async (table) => {
    table.string('channel')
    table.string('platform')
    table.date('ymd')
    table.timestamp('updated_at').defaultTo(null)
    table.string('version')
    table.index(['ymd', 'platform', 'channel'])
  })
}

exports.down = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', async (table) => {
    table.dropColumn('channel')
    table.dropColumn('platform')
    table.dropColumn('ymd')
    table.dropColumn('updated_at')
    table.dropColumn('version')
  })
}
