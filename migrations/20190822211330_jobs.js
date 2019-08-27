exports.up = async (knex) => {
  await knex.raw(`
CREATE TABLE dtl.remote_jobs (
  id        text      not null primary key,
  ts        timestamp not null default current_timestamp,
  job       text      not null,
  params    json      not null,
  status    text      not null default 'pending' check ( status in ('pending', 'processing', 'partial', 'complete', 'error') ),
  status_ts timestamp not null default current_timestamp,
  results   json
);`)
}

exports.down = async (knex) => {
  await knex.raw(`
  DROP TABLE dtl.remote_jobs;
  `)
}
