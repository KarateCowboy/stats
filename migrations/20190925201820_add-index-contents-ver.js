exports.up = async (knex) => {
  await knex.raw('create index on dtl.crashes((contents->>\'ver\'))')
}

exports.down = async (knex) => {
  await knex.raw('drop index dtl.crashes_expr_idx')
}
