exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE dw.fc_thirty_day_referral_stats (
      ymd            DATE NOT NULL,
      ref            TEXT NOT NULL,
      platform       TEXT NOT NULL,
      downloads      INTEGER NOT NULL,
      installs       INTEGER NOT NULL,
      confirmations  INTEGER NOT NULL,
      PRIMARY KEY (ymd, ref, platform)
    );
  `)
}

exports.down = async (knex) => {
  await knex.raw(`DROP TABLE dw.fc_thirty_day_referral_stats;`)
}
