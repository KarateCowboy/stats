exports.up = async function (knex, Promise) {
  await knex.raw(` CREATE MATERIALIZED VIEW dw.daily_downloads AS
    SELECT
    id,
    to_char(timestamp, 'YYYY-MM-DD') AS ymd,
    platform,
    count(*) as count
    FROM dw.downloads
    GROUP BY id, ymd, platform;
    `)
}

exports.down = async function (knex, Promise) {
  await knex.raw('DROP MATERIALIZED VIEW dw.daily_downloads')
}
