exports.up = async function (knex, Promise) {
  await knex.schema.withSchema('dw').createTable('fc_usage_month_exceptions', (table) => {
    table.increments()
    table.date('ymd')
    table.text('platform')
    table.text('version')
    table.text('channel')
    table.integer('total')
    table.text('ref')
    table.timestamps(true, true)
  })
}

exports.down = async function (knex, Promise) {
  await knex.schema.withSchema('dw').dropTable('fc_usage_month_exceptions')
}

// stats_test=> \d dw.fc_usage_month
// Table "dw.fc_usage_month"
// Column  |  Type  | Collation | Nullable |   Default
// ----------+--------+-----------+----------+--------------
//   ymd      | date   |           | not null |
// platform | text   |           | not null |
// version  | text   |           | not null |
// channel  | text   |           | not null |
// total    | bigint |           | not null | 0
// ref      | text   |           | not null | 'none'::text
