/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var common = require('./common')

const EYESHADE_WALLETS = `
SELECT
  TO_CHAR(FC.created, 'YYYY-MM-DD') AS ymd,
  FC.wallets AS count
FROM dw.fc_wallets FC
WHERE
  FC.created >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date)
ORDER BY FC.created DESC
`

const EYESHADE_FUNDED_WALLETS = `
SELECT
  TO_CHAR(FC.created, 'YYYY-MM-DD') AS ymd,
  FC.funded AS count
FROM dw.fc_wallets FC
WHERE
  FC.created >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date)
ORDER BY FC.created DESC
`

const EYESHADE_FUNDED_WALLETS_PERCENTAGE = `
SELECT
  TO_CHAR(FC.created, 'YYYY-MM-DD') AS ymd,
  (FC.funded + 0.0) / GREATEST(FC.wallets + 0.0, 1.0) AS count
FROM dw.fc_wallets FC
WHERE
  FC.created >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-09-01'::date)
ORDER BY FC.created DESC
`

const EYESHADE_FUNDED_WALLETS_BALANCE = `
SELECT
  TO_CHAR(FC.created, 'YYYY-MM-DD') AS ymd,
  (FC.balance / 100000000.0) * ( SELECT quote FROM dw.btc_quotes WHERE currency_code = 'USD' ) AS count
FROM dw.fc_wallets FC
WHERE
  FC.created >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date)
ORDER BY FC.created DESC
`

const EYESHADE_FUNDED_WALLETS_BALANCE_AVERAGE = `
SELECT
  TO_CHAR(FC.created, 'YYYY-MM-DD') AS ymd,
  (FC.balance / GREATEST(FC.funded, 1.0) / 100000000.0) * ( SELECT quote FROM dw.btc_quotes WHERE currency_code = 'USD' ) as count
FROM dw.fc_wallets FC
WHERE
  FC.created >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-09-01'::date)
ORDER BY FC.created DESC
`

const EYESHADE_WALLETS_TOTAL = `
SELECT
  wallets,
  balance,
  funded,
  ( SELECT quote FROM dw.bat_quotes WHERE currency_code = 'USD' ) as bat_usd
FROM
( SELECT
  SUM(wallets)               AS wallets,
  SUM(balance)               AS balance,
  SUM(funded)                AS funded
  FROM dw.fc_wallets ) OVERVIEW
`

// Return an array containing a day offset i.e. ['3 days']
const commonDaysParamsBuilder = (request) => {
  return [parseInt(request.query.days || 7) + ' days']
}

// Default success handler
const commonSuccessHandler = ( results, request) => {
  results.rows.forEach((row) => row.count = parseFloat(row.count))
  results.rows = common.potentiallyFilterToday(
    results.rows,
    request.query.showToday === 'true'
  )
  return (results.rows)
}

// Endpoint definitions
exports.setup = (server, client, mongo) => {

  // Eyeshade / ledger wallets by day
  server.route({
    method: 'GET',
    path: '/api/1/eyeshade_wallets',
    handler: common.buildQueryReponseHandler(
      client,
      EYESHADE_WALLETS,
      commonSuccessHandler,
      commonDaysParamsBuilder
    )
  })

  // Eyeshade / ledger funded wallets by day
  server.route({
    method: 'GET',
    path: '/api/1/eyeshade_funded_wallets',
    handler: common.buildQueryReponseHandler(
      client,
      EYESHADE_FUNDED_WALLETS,
      commonSuccessHandler,
      commonDaysParamsBuilder
    )
  })

  // Eyeshade / ledger funded percentage of wallets by day
  server.route({
    method: 'GET',
    path: '/api/1/eyeshade_funded_percentage_wallets',
    handler: common.buildQueryReponseHandler(
      client,
      EYESHADE_FUNDED_WALLETS_PERCENTAGE,
      commonSuccessHandler,
      commonDaysParamsBuilder
    )
  })

  // Eyeshade / ledger funded balance by day
  server.route({
    method: 'GET',
    path: '/api/1/eyeshade_funded_balance_wallets',
    handler: common.buildQueryReponseHandler(
      client,
      EYESHADE_FUNDED_WALLETS_BALANCE,
      commonSuccessHandler,
      commonDaysParamsBuilder
    )
  })

  // Eyeshade / ledger funded wallets average balance by day
  server.route({
    method: 'GET',
    path: '/api/1/eyeshade_funded_balance_average_wallets',
    handler: common.buildQueryReponseHandler(
      client,
      EYESHADE_FUNDED_WALLETS_BALANCE_AVERAGE,
      commonSuccessHandler,
      commonDaysParamsBuilder
    )
  })

  // Ledger overview summary statistics
  server.route({
    method: 'GET',
    path: '/api/1/ledger_overview',
    handler: common.buildQueryReponseHandler(
      client,
      EYESHADE_WALLETS_TOTAL,
      ( results) => {
        return ({
          wallets: parseInt(results.rows[0].wallets),
          balance: parseInt(results.rows[0].balance),
          funded: parseInt(results.rows[0].funded),
          bat_usd: parseFloat(results.rows[0].bat_usd)
        })
      }
    )
  })
}
