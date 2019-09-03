const common = require('../api/common')
const dataset = require('../api/dataset')

const DAU_COUNTRY = `
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.country_code,
  SUM(FC.total) AS count
FROM dw.fc_agg_usage_daily FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2019-02-21'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.ref = ANY (COALESCE($4, ARRAY[FC.ref])) AND
  FC.woi = ANY (COALESCE($5, ARRAY[FC.woi])) AND
  FC.country_code = ANY (COALESCE($6, ARRAY[FC.country_code]))
GROUP BY FC.ymd, FC.country_code
ORDER BY FC.ymd DESC, FC.country_code
`

const DAUCountry = async (client, params) => {
  var { days, platforms, channels, ref, wois, countryCodes, showToday } = params
  console.log(params)
  const results = await client.query(DAU_COUNTRY, [days, platforms, channels, ref, wois, countryCodes])
  results.rows.forEach((row) => common.formatPGRow(row))
  results.rows = common.potentiallyFilterToday(results.rows, showToday)
  // condense small country counts to an 'other' category
  results.rows = dataset.condense(results.rows, 'ymd', 'country_code', 0.002)
  return results.rows
}

module.exports = {
  DAUCountry
}
