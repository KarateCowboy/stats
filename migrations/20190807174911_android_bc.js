exports.up = async (knex) => {
  await knex.raw(`
INSERT INTO dtl.platforms (platform, description, label) VALUES ('android-bc', 'Android Core', 'Android Core');

ALTER TABLE ONLY dw.fc_usage DROP CONSTRAINT valid_platforms;
ALTER TABLE ONLY dw.fc_usage ADD CONSTRAINT fk_platforms FOREIGN KEY (platform) REFERENCES dtl.platforms(platform);

ALTER TABLE ONLY dw.fc_usage_month DROP CONSTRAINT valid_platforms;
ALTER TABLE ONLY dw.fc_usage_month ADD CONSTRAINT fk_platforms FOREIGN KEY (platform) REFERENCES dtl.platforms(platform);

ALTER TABLE ONLY dw.fc_retention_woi DROP CONSTRAINT valid_platforms;
ALTER TABLE ONLY dw.fc_retention_woi ADD CONSTRAINT fk_platforms FOREIGN KEY (platform) REFERENCES dtl.platforms(platform);

ALTER TABLE ONLY dw.fc_usage_exceptions DROP CONSTRAINT valid_platforms;
ALTER TABLE ONLY dw.fc_usage_exceptions ADD CONSTRAINT fk_platforms FOREIGN KEY (platform) REFERENCES dtl.platforms(platform);

ALTER TABLE ONLY dw.fc_fastly_usage DROP CONSTRAINT valid_platforms;
ALTER TABLE ONLY dw.fc_fastly_usage ADD CONSTRAINT fk_platforms FOREIGN KEY (platform) REFERENCES dtl.platforms(platform);

ALTER TABLE ONLY dw.fc_fastly_calendar_month_usage DROP CONSTRAINT valid_platforms;
ALTER TABLE ONLY dw.fc_fastly_calendar_month_usage ADD CONSTRAINT fk_platforms FOREIGN KEY (platform) REFERENCES dtl.platforms(platform);

create function sp.product_from_platform(_platform text) returns text as $$
begin
  if _platform = 'androidbrowser' or _platform = 'android-bc' then return 'android'; end if;
  if _platform = 'ios' then return 'ios'; end if;
  if _platform = ANY (ARRAY['winx64', 'winia32', 'linux', 'osx']) then return 'muon'; end if;
  if _platform = ANY (ARRAY['winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc']) then return 'core'; end if;
  return null;
end;

$$ language plpgsql;
DROP MATERIALIZED VIEW dw.fc_country_seven_day_dau_average;
CREATE MATERIALIZED VIEW dw.fc_country_seven_day_dau_average AS
  SELECT pr.product,
    pr.id,
    pr.label,
    pr.region_id,
    round((pr.total / (7)::numeric)) AS avg_dau,
    round((pr.total / sum(pr.total) OVER (PARTITION BY pr.product)), 4) AS percentage
   FROM ( SELECT
            sp.product_from_platform(fc.platform) as product,
            ct.id,
            ct.label,
            ct.region_id,
            sum(fc.total) AS total
          FROM (dw.fc_agg_usage_daily fc
            JOIN dtl.countries ct ON ((fc.country_code = ct.id)))
          WHERE ((fc.ymd >= ((CURRENT_TIMESTAMP - '7 days'::interval))::date) AND (fc.ymd < (CURRENT_TIMESTAMP)::date) AND (fc.channel = ANY (ARRAY['stable'::text, 'release'::text, 'dev'::text])))
          GROUP BY sp.product_from_platform(fc.platform), ct.id, ct.label, ct.region_id
          ORDER BY sp.product_from_platform(fc.platform), ct.id, ct.label, ct.region_id) pr
  WHERE (pr.product IS NOT NULL)
  WITH NO DATA;
REFRESH MATERIALIZED VIEW dw.fc_country_seven_day_dau_average;

DROP MATERIALIZED VIEW dw.fc_region_seven_day_dau_average;
CREATE MATERIALIZED VIEW dw.fc_region_seven_day_dau_average AS
 SELECT pr.product,
    pr.id,
    pr.ord,
    round((pr.total / (7)::numeric)) AS avg_dau,
    round((pr.total / sum(pr.total) OVER (PARTITION BY pr.product)), 4) AS percentage
   FROM ( SELECT
            sp.product_from_platform(fc.platform) as product,
            rg.id,
            rg.ord,
            sum(fc.total) AS total
           FROM ((dw.fc_agg_usage_daily fc
             JOIN dtl.countries ct ON ((fc.country_code = ct.id)))
             JOIN dtl.regions rg ON ((ct.region_id = rg.id)))
          WHERE ((fc.ymd >= ((CURRENT_TIMESTAMP - '7 days'::interval))::date) AND (fc.ymd < (CURRENT_TIMESTAMP)::date) AND (fc.channel = ANY (ARRAY['stable'::text, 'release'::text, 'dev'::text])))
          GROUP BY sp.product_from_platform(fc.platform), rg.id, rg.ord
          ORDER BY sp.product_from_platform(fc.platform), rg.id, rg.ord) pr
  WHERE (pr.product IS NOT NULL)
  WITH NO DATA;
REFRESH MATERIALIZED VIEW dw.fc_region_seven_day_dau_average;
  `);
}

exports.down = async (knex) => {
  await knex.raw(`
DROP MATERIALIZED VIEW dw.fc_region_seven_day_dau_average;
CREATE MATERIALIZED VIEW dw.fc_region_seven_day_dau_average AS
 SELECT pr.product,
    pr.id,
    pr.ord,
    round((pr.total / (7)::numeric)) AS avg_dau,
    round((pr.total / sum(pr.total) OVER (PARTITION BY pr.product)), 4) AS percentage
   FROM ( SELECT
                CASE
                    WHEN (fc.platform = 'androidbrowser'::text) THEN 'android'::text
                    WHEN (fc.platform = 'ios'::text) THEN 'ios'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64'::text, 'winia32'::text, 'linux'::text, 'osx'::text])) THEN 'muon'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64-bc'::text, 'winia32-bc'::text, 'linux-bc'::text, 'osx-bc'::text])) THEN 'core'::text
                    ELSE NULL::text
                END AS product,
            rg.id,
            rg.ord,
            sum(fc.total) AS total
           FROM ((dw.fc_agg_usage_daily fc
             JOIN dtl.countries ct ON ((fc.country_code = ct.id)))
             JOIN dtl.regions rg ON ((ct.region_id = rg.id)))
          WHERE ((fc.ymd >= ((CURRENT_TIMESTAMP - '7 days'::interval))::date) AND (fc.ymd < (CURRENT_TIMESTAMP)::date) AND (fc.channel = ANY (ARRAY['stable'::text, 'release'::text, 'dev'::text])))
          GROUP BY
                CASE
                    WHEN (fc.platform = 'androidbrowser'::text) THEN 'android'::text
                    WHEN (fc.platform = 'ios'::text) THEN 'ios'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64'::text, 'winia32'::text, 'linux'::text, 'osx'::text])) THEN 'muon'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64-bc'::text, 'winia32-bc'::text, 'linux-bc'::text, 'osx-bc'::text])) THEN 'core'::text
                    ELSE NULL::text
                END, rg.id, rg.ord
          ORDER BY
                CASE
                    WHEN (fc.platform = 'androidbrowser'::text) THEN 'android'::text
                    WHEN (fc.platform = 'ios'::text) THEN 'ios'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64'::text, 'winia32'::text, 'linux'::text, 'osx'::text])) THEN 'muon'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64-bc'::text, 'winia32-bc'::text, 'linux-bc'::text, 'osx-bc'::text])) THEN 'core'::text
                    ELSE NULL::text
                END, rg.id, rg.ord) pr
  WHERE (pr.product IS NOT NULL)
  WITH NO DATA;
REFRESH MATERIALIZED VIEW dw.fc_region_seven_day_dau_average;

DROP MATERIALIZED VIEW dw.fc_country_seven_day_dau_average;
CREATE MATERIALIZED VIEW dw.fc_country_seven_day_dau_average AS
 SELECT pr.product,
    pr.id,
    pr.label,
    pr.region_id,
    round((pr.total / (7)::numeric)) AS avg_dau,
    round((pr.total / sum(pr.total) OVER (PARTITION BY pr.product)), 4) AS percentage
   FROM ( SELECT
                CASE
                    WHEN (fc.platform = 'androidbrowser'::text) THEN 'android'::text
                    WHEN (fc.platform = 'ios'::text) THEN 'ios'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64'::text, 'winia32'::text, 'linux'::text, 'osx'::text])) THEN 'muon'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64-bc'::text, 'winia32-bc'::text, 'linux-bc'::text, 'osx-bc'::text])) THEN 'core'::text
                    ELSE NULL::text
                END AS product,
            ct.id,
            ct.label,
            ct.region_id,
            sum(fc.total) AS total
           FROM (dw.fc_agg_usage_daily fc
             JOIN dtl.countries ct ON ((fc.country_code = ct.id)))
          WHERE ((fc.ymd >= ((CURRENT_TIMESTAMP - '7 days'::interval))::date) AND (fc.ymd < (CURRENT_TIMESTAMP)::date) AND (fc.channel = ANY (ARRAY['stable'::text, 'release'::text, 'dev'::text])))
          GROUP BY
                CASE
                    WHEN (fc.platform = 'androidbrowser'::text) THEN 'android'::text
                    WHEN (fc.platform = 'ios'::text) THEN 'ios'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64'::text, 'winia32'::text, 'linux'::text, 'osx'::text])) THEN 'muon'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64-bc'::text, 'winia32-bc'::text, 'linux-bc'::text, 'osx-bc'::text])) THEN 'core'::text
                    ELSE NULL::text
                END, ct.id, ct.label, ct.region_id
          ORDER BY
                CASE
                    WHEN (fc.platform = 'androidbrowser'::text) THEN 'android'::text
                    WHEN (fc.platform = 'ios'::text) THEN 'ios'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64'::text, 'winia32'::text, 'linux'::text, 'osx'::text])) THEN 'muon'::text
                    WHEN (fc.platform = ANY (ARRAY['winx64-bc'::text, 'winia32-bc'::text, 'linux-bc'::text, 'osx-bc'::text])) THEN 'core'::text
                    ELSE NULL::text
                END, ct.id, ct.label, ct.region_id) pr
  WHERE (pr.product IS NOT NULL)
  WITH NO DATA;
REFRESH MATERIALIZED VIEW dw.fc_country_seven_day_dau_average;

drop function sp.product_from_platform(_platform text);

ALTER TABLE ONLY dw.fc_fastly_calendar_month_usage DROP CONSTRAINT fk_platforms;
ALTER TABLE ONLY dw.fc_fastly_calendar_month_usage ADD CONSTRAINT valid_platforms CHECK (platform = ANY (ARRAY['osx'::text, 'winx64'::text, 'winia32'::text, 'android'::text, 'ios'::text, 'unknown'::text, 'linux'::text, 'androidbrowser'::text, 'osx-bc'::text, 'linux-bc'::text, 'winx64-bc'::text, 'winia32-bc'::text]));

ALTER TABLE ONLY dw.fc_fastly_usage DROP CONSTRAINT fk_platforms;
ALTER TABLE ONLY dw.fc_fastly_usage ADD CONSTRAINT valid_platforms CHECK (platform = ANY (ARRAY['osx'::text, 'winx64'::text, 'winia32'::text, 'android'::text, 'ios'::text, 'unknown'::text, 'linux'::text, 'androidbrowser'::text, 'osx-bc'::text, 'linux-bc'::text, 'winx64-bc'::text, 'winia32-bc'::text]));

ALTER TABLE ONLY dw.fc_usage_exceptions DROP CONSTRAINT fk_platforms;
ALTER TABLE ONLY dw.fc_usage_exceptions ADD CONSTRAINT valid_platforms CHECK (platform = ANY (ARRAY['osx'::text, 'winx64'::text, 'winia32'::text, 'android'::text, 'ios'::text, 'unknown'::text, 'linux'::text, 'androidbrowser'::text, 'osx-bc'::text, 'linux-bc'::text, 'winx64-bc'::text, 'winia32-bc'::text]));

ALTER TABLE ONLY dw.fc_retention_woi DROP CONSTRAINT fk_platforms;
ALTER TABLE ONLY dw.fc_retention_woi ADD CONSTRAINT valid_platforms CHECK (platform = ANY (ARRAY['osx'::text, 'winx64'::text, 'winia32'::text, 'android'::text, 'ios'::text, 'unknown'::text, 'linux'::text, 'androidbrowser'::text, 'osx-bc'::text, 'linux-bc'::text, 'winx64-bc'::text, 'winia32-bc'::text]));

ALTER TABLE ONLY dw.fc_usage_month DROP CONSTRAINT fk_platforms;
ALTER TABLE ONLY dw.fc_usage_month ADD CONSTRAINT valid_platforms CHECK (platform = ANY (ARRAY['osx'::text, 'winx64'::text, 'winia32'::text, 'android'::text, 'ios'::text, 'unknown'::text, 'linux'::text, 'androidbrowser'::text, 'osx-bc'::text, 'linux-bc'::text, 'winx64-bc'::text, 'winia32-bc'::text]));

ALTER TABLE ONLY dw.fc_usage DROP CONSTRAINT fk_platforms;
ALTER TABLE ONLY dw.fc_usage ADD CONSTRAINT valid_platforms CHECK (platform = ANY (ARRAY['osx'::text, 'winx64'::text, 'winia32'::text, 'android'::text, 'ios'::text, 'unknown'::text, 'linux'::text, 'androidbrowser'::text, 'osx-bc'::text, 'linux-bc'::text, 'winx64-bc'::text, 'winia32-bc'::text]));

DELETE FROM dtl.platforms WHERE platform = 'android-bc';
  `);
}
