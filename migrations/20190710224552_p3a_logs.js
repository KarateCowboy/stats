exports.up = async (knex) => {
  await knex.raw(`
create table dw.p3a_logs (
  wos             date   not null,
  woi             date   not null,
  platform        text   not null,
  channel         text   not null,
  ref             text   not null default 'none',
  country_code    text   not null,
  version         text   not null,
  metric_id       text   not null,
  metric_value    text   not null,
  total           bigint not null default 0,
  primary key (wos, woi, platform, channel, ref, country_code, version, metric_id, metric_value)
);

create table dw.p3a_state (
  id                   text not null primary key,
  last_key             text not null
);
    `)
}

exports.down = async (knex) => {
  await knex.raw(`
    drop table dw.p3a_state;
    drop table dw.p3a_logs;
    `)
}
