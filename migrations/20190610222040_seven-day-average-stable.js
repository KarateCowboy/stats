exports.up = async (knex) => {
  await knex.raw(`
  DROP MATERIALIZED VIEW dw.fc_region_seven_day_dau_average;
  CREATE MATERIALIZED VIEW dw.fc_region_seven_day_dau_average AS
  SELECT product, id, ord, ROUND(total / 7) AS avg_dau, ROUND(total / sum(total) OVER (PARTITION BY product), 4) AS percentage FROM (
select
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end as product,
  RG.id,
  RG.ord,
  sum(total) as total
from
  dw.fc_agg_usage_daily FC join
  dtl.countries CT ON FC.country_code = CT.id join
  dtl.regions RG ON CT.region_id = RG.id
where
  ( ymd >= (current_timestamp - '7 days'::interval)::date and ymd < current_timestamp::date ) AND
  channel in ('stable', 'release', 'dev')
group by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  RG.id,
  RG.ord
order by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  RG.id,
  RG.ord
) PR
WHERE product IS NOT NULL
;

  DROP MATERIALIZED VIEW dw.fc_country_seven_day_dau_average;
  CREATE MATERIALIZED VIEW dw.fc_country_seven_day_dau_average AS
SELECT product, id, label, region_id, ROUND(total / 7) AS avg_dau, ROUND(total / sum(total) OVER (PARTITION BY product), 4) AS percentage FROM (
SELECT
  CASE
    WHEN platform in ('androidbrowser') THEN 'android'
    WHEN platform in ('ios') THEN 'ios'
    WHEN platform in ('winx64', 'winia32', 'linux', 'osx') THEN 'muon'
    WHEN platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') THEN 'core'
  END AS product,
  CT.id,
  CT.label,
  CT.region_id,
  SUM(total) AS total
from
  dw.fc_agg_usage_daily FC join
  dtl.countries CT ON FC.country_code = CT.id
where
  ( ymd >= (current_timestamp - '7 days'::interval)::date and ymd < current_timestamp::date ) AND
  channel IN ('stable', 'release', 'dev')
group by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  CT.id,
  CT.label,
  CT.region_id
order by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  CT.id,
  CT.label,
  CT.region_id
) PR
WHERE product IS NOT NULL
;
`)
};

exports.down = async (knex) => {
  await knex.raw(`
  DROP MATERIALIZED VIEW dw.fc_region_seven_day_dau_average;
  CREATE MATERIALIZED VIEW dw.fc_region_seven_day_dau_average AS
  SELECT product, id, ord, ROUND(total / 7) AS avg_dau, ROUND(total / sum(total) OVER (PARTITION BY product), 4) AS percentage FROM (
select
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end as product,
  RG.id,
  RG.ord,
  sum(total) as total
from
  dw.fc_agg_usage_daily FC join
  dtl.countries CT ON FC.country_code = CT.id join
  dtl.regions RG ON CT.region_id = RG.id
where
  ymd >= (current_timestamp - '7 days'::interval)::date and ymd < current_timestamp::date
group by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  RG.id,
  RG.ord
order by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  RG.id,
  RG.ord
) PR
WHERE product IS NOT NULL
;

  DROP MATERIALIZED VIEW dw.fc_country_seven_day_dau_average;
  CREATE MATERIALIZED VIEW dw.fc_country_seven_day_dau_average AS
SELECT product, id, label, region_id, ROUND(total / 7) AS avg_dau, ROUND(total / sum(total) OVER (PARTITION BY product), 4) AS percentage FROM (
SELECT
  CASE
    WHEN platform in ('androidbrowser') THEN 'android'
    WHEN platform in ('ios') THEN 'ios'
    WHEN platform in ('winx64', 'winia32', 'linux', 'osx') THEN 'muon'
    WHEN platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') THEN 'core'
  END AS product,
  CT.id,
  CT.label,
  CT.region_id,
  SUM(total) AS total
from
  dw.fc_agg_usage_daily FC join
  dtl.countries CT ON FC.country_code = CT.id
where
  ymd >= (current_timestamp - '7 days'::interval)::date and ymd < current_timestamp::date
group by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  CT.id,
  CT.label,
  CT.region_id
order by
  case
    when platform in ('androidbrowser') then 'android'
    when platform in ('ios') then 'ios'
    when platform in ('winx64', 'winia32', 'linux', 'osx') then 'muon'
    when platform in ('winx64-bc', 'winia32-bc', 'linux-bc', 'osx-bc') then 'core'
  end,
  CT.id,
  CT.label,
  CT.region_id
) PR
WHERE product IS NOT NULL
;
`)
};
