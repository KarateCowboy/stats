const { ref } = require('objection')

exports.up = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', async (table) => {
    table.boolean('is_core').defaultTo(true)
    table.boolean('has_valid_version').defaultTo(false)
  })
  await knex('dtl.crashes').update({ is_core: false }).where(knex.raw("contents->>'ver' ~ '^[654321]{1,1}[0-9]+'"))
  await knex('dtl.crashes').update({ has_valid_version: true }).where(knex.raw(`contents->>'ver' ~ '^[0-9]+\.[0-9]+\.[0-9]+[\.]*[0-9]*$'`))
}

exports.down = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', async (table) => {
    table.dropColumn('is_core')
    table.dropColumn('has_valid_version')
  })
}
