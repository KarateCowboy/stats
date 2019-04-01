exports.up = async (knex) => {
  await knex.schema.withSchema('dw').createTable('publisher_totals', (table) => {
    table.increments('id')
    table.integer('email_verified_with_a_verified_channel_and_uphold_verified').defaultTo(0)
    table.integer('email_verified_with_a_verified_channel').defaultTo(0)
    table.integer('email_verified_with_a_channel').defaultTo(0)
    table.integer('email_verified').defaultTo(0)
    table.timestamps()
  })
}

exports.down = async (knex) => {
  await knex.schema.withSchema('dw').dropTable('publisher_totals')
}
