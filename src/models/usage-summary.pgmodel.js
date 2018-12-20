/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const moment = require('moment')

module.exports = (sequelize, Sequelize) => {
  const UsageSummary = sequelize.define('UsageSummary',
    {
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      ymd: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      platform: {
        type: Sequelize.ENUM('linux', 'linux-bc', 'winia32', 'winia32-bc', 'winx64', 'winx64-bc', 'ios', 'androidbrowser', 'android', 'osx', 'osx-bc')
      },
      version: {
        type: Sequelize.STRING
      },
      first_time: {
        type: Sequelize.BOOLEAN
      },
      total: {type: Sequelize.INTEGER},
      channel: {
        type: Sequelize.ENUM('release', 'stable', 'beta', 'developer', 'nightly', 'dev')
      },
      ref: {
        type: Sequelize.STRING
      }
    }

    , {
      underscored: true,
      schema:
        'dw',
      tableName:
        'fc_usage',
      timestamps:
        true,
      freezeTableName:
        true
    }
  )
  UsageSummary.firstCount = async function (ymd, platforms, channels, ref) {
    const ymd_range = Math.abs(moment(ymd).diff(moment(), 'days'))
    const query = `SELECT
    TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
      FC.platform,
      SUM(FC.total) AS first_count
    FROM dw.fc_usage FC
    WHERE
    FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
    FC.platform = ANY ($2) AND
    FC.channel = ANY ($3) AND
    FC.ref = ANY($4) AND
    FC.first_time
    GROUP BY FC.ymd, FC.platform
    ORDER BY FC.ymd DESC, FC.platform`
    const result = await pg_client.query(query, [ymd_range.toString() + ' days', platforms, channels, ref])
    return result
  }

  UsageSummary.platformMinusFirstSQL = async function (ymd, platforms, channels, ref) {
    let ymd_range
    if (ymd.match(/days/)) {
      ymd_range = ymd
    } else {
      ymd_range = Math.abs(moment(ymd).diff(moment(), 'days'))
      ymd_range = ymd_range.toString() + ' days'
    }
    const query = `
SELECT
  USAGE.ymd,
  USAGE.platform,
  USAGE.count AS all_count,
  FIR.first_count,
  USAGE.count - FIR.first_count AS count
FROM
(
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS count
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) 
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) USAGE JOIN (
SELECT
  TO_CHAR(FC.ymd, 'YYYY-MM-DD') AS ymd,
  FC.platform,
  SUM(FC.total) AS first_count
FROM dw.fc_usage FC
WHERE
  FC.ymd >= GREATEST(current_date - CAST($1 as INTERVAL), '2016-01-26'::date) AND
  FC.platform = ANY ($2) AND
  FC.channel = ANY ($3) AND
  FC.first_time
GROUP BY FC.ymd, FC.platform
  ORDER BY FC.ymd DESC, FC.platform
) FIR ON USAGE.ymd = FIR.ymd AND USAGE.platform = FIR.platform
ORDER BY USAGE.ymd DESC, USAGE.platform
`
    const result = await pg_client.query(query, [ymd_range, platforms, channels])
    return result
  }

  return UsageSummary
}


