exports.up = async (knex) => {
  await knex.raw(`ALTER TABLE dtl.crashes DROP COLUMN github_repo CASCADE`)
  await knex.raw(`ALTER TABLE dtl.crashes DROP COLUMN github_issue_number CASCADE`)
}

exports.down = async (knex) => {
  await knex.schema.withSchema('dtl').alterTable('crashes', function (table) {
    table.text('github_repo')
    table.text('github_issue_number')
  })
}
