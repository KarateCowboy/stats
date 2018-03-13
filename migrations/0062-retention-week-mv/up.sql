create materialized view dw.fc_retention_week_mv as
select
  platform,
  channel,
  ref,
  woi,
  week_delta,
  average as current,
  max(average) over (partition by platform, channel, ref, woi, 0) starting,
  average / max(average) over (partition by platform, channel, ref, woi, 0) as retained_percentage
from (
select
  platform as platform,
  channel as channel,
  ref as ref,
  to_char(woi, 'YYYY-MM-DD') as woi,
  week_diff(to_char(ymd, 'YYYY-MM-DD')::date, to_char(woi, 'YYYY-MM-DD')::date) week_delta,
  avg(total) as average
from dw.fc_retention_woi
where week_diff(to_char(ymd, 'YYYY-MM-DD')::date, to_char(woi, 'YYYY-MM-DD')::date) >= 0
group by
  platform,
  channel,
  ref,
  to_char(woi, 'YYYY-MM-DD'),
  week_diff(to_char(ymd, 'YYYY-MM-DD')::date, to_char(woi, 'YYYY-MM-DD')::date)
order by
  platform,
  channel,
  ref,
  to_char(woi, 'YYYY-MM-DD'),
  week_diff(to_char(ymd, 'YYYY-MM-DD')::date, to_char(woi, 'YYYY-MM-DD')::date)
) I;

