exports.up = async (knex) => {
  await knex.raw(`
CREATE INDEX agg_daily_ymd_idx on dw.fc_agg_usage_daily(ymd);
CREATE INDEX agg_daily_platform_idx on dw.fc_agg_usage_daily(platform);
CREATE INDEX agg_daily_channel_idx on dw.fc_agg_usage_daily(channel);
CREATE INDEX agg_daily_version_idx on dw.fc_agg_usage_daily(version);
CREATE INDEX agg_daily_ref_idx on dw.fc_agg_usage_daily(ref);
CREATE INDEX agg_daily_woi_idx on dw.fc_agg_usage_daily(woi);
CREATE INDEX agg_daily_country_code_idx on dw.fc_agg_usage_daily(country_code);
CREATE INDEX agg_weekly_ymd_idx on dw.fc_agg_usage_weekly(ymd);
CREATE INDEX agg_weekly_platform_idx on dw.fc_agg_usage_weekly(platform);
CREATE INDEX agg_weekly_channel_idx on dw.fc_agg_usage_weekly(channel);
CREATE INDEX agg_weekly_version_idx on dw.fc_agg_usage_weekly(version);
CREATE INDEX agg_weekly_ref_idx on dw.fc_agg_usage_weekly(ref);
CREATE INDEX agg_weekly_woi_idx on dw.fc_agg_usage_weekly(woi);
CREATE INDEX agg_weekly_country_code_idx on dw.fc_agg_usage_weekly(country_code);
CREATE INDEX agg_monthly_ymd_idx on dw.fc_agg_usage_monthly(ymd);
CREATE INDEX agg_monthly_platform_idx on dw.fc_agg_usage_monthly(platform);
CREATE INDEX agg_monthly_channel_idx on dw.fc_agg_usage_monthly(channel);
CREATE INDEX agg_monthly_version_idx on dw.fc_agg_usage_monthly(version);
CREATE INDEX agg_monthly_ref_idx on dw.fc_agg_usage_monthly(ref);
CREATE INDEX agg_monthly_woi_idx on dw.fc_agg_usage_monthly(woi);
CREATE INDEX agg_monthly_country_code_idx on dw.fc_agg_usage_monthly(country_code);
  `)
};

exports.down = async (knex) => {
  await knex.raw(`
DROP INDEX dw.agg_daily_ymd_idx;
DROP INDEX dw.agg_daily_platform_idx;
DROP INDEX dw.agg_daily_channel_idx;
DROP INDEX dw.agg_daily_version_idx;
DROP INDEX dw.agg_daily_ref_idx;
DROP INDEX dw.agg_daily_woi_idx;
DROP INDEX dw.agg_daily_country_code_idx;
DROP INDEX dw.agg_weekly_ymd_idx;
DROP INDEX dw.agg_weekly_platform_idx;
DROP INDEX dw.agg_weekly_channel_idx;
DROP INDEX dw.agg_weekly_version_idx;
DROP INDEX dw.agg_weekly_ref_idx;
DROP INDEX dw.agg_weekly_woi_idx;
DROP INDEX dw.agg_weekly_country_code_idx;
DROP INDEX dw.agg_monthly_ymd_idx;
DROP INDEX dw.agg_monthly_platform_idx;
DROP INDEX dw.agg_monthly_channel_idx;
DROP INDEX dw.agg_monthly_version_idx;
DROP INDEX dw.agg_monthly_ref_idx;
DROP INDEX dw.agg_monthly_woi_idx;
DROP INDEX dw.agg_monthly_country_code_idx;
  `);
};
