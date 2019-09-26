exports.up = async (knex) => {
  const sql = `CREATE INDEX crashes_multi_idx_2 ON dtl.crashes(
   is_core,
   has_valid_version,
  (contents->>'year_month_day'))
  `
  await knex.raw(sql)
}

exports.down = async (knex) => {
  await knex.raw('drop index dtl.crashes_multi_idx_2')
}
