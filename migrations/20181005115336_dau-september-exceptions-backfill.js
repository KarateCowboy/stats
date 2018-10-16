/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */


let backfillData = [['2018-09-12',76768],
['2018-09-13', 87775],
['2018-09-14', 79949],
['2018-09-15', 142870],
['2018-09-16', 144366],
['2018-09-17', 120800],
['2018-09-18', 88995],
['2018-09-19', 138161],
['2018-09-20', 171203],
['2018-09-21', 149177],
['2018-09-22', 139056],
['2018-09-23', 156745],
['2018-09-24', 192119],
['2018-09-25', 173662],
['2018-09-26', 36880]]

exports.up = async function (knex, Promise) {
  await knex.raw(`ALTER TABLE dw.fc_usage_exceptions DROP CONSTRAINT valid_platforms`)

  await knex.raw(`ALTER TABLE dw.fc_usage_exceptions ADD CONSTRAINT valid_platforms CHECK ( platform IN ( 'osx', 'winx64', 'android', 'ios', 'unknown', 'linux', 'androidbrowser', 'osx-bc', 'linux-bc', 'winx64-bc', 'winia32-bc' ) );`)
  for (let row of backfillData) {
    await knex('dw.fc_usage_exceptions').insert({
      ymd: row[0],
      total: Math.round( row[1]),// * 0.07),
      channel: 'stable',
      platform: 'androidbrowser',
      version: '1.0.5901',
      ref: 'none',
      first_time: false
    })

  }
}

exports.down = async function (knex, Promise) {
  for (let row of backfillData) {
    await knex('dw.fc_usage_exceptions').where({
      ymd: row[0],
      total: row[1],
      channel: 'stable',
      platform: 'androidbrowser',
      version: '1.0.5901',
      ref: 'none',
      first_time: false
    }).delete()
  }
  await knex.raw(`ALTER TABLE dw.fc_usage_exceptions DROP CONSTRAINT valid_platforms`)
  await knex.raw(`ALTER TABLE dw.fc_usage_exceptions ADD CONSTRAINT valid_platforms CHECK ( platform IN ( 'osx', 'winx64', 'android', 'ios', 'unknown', 'linux') );`)
}

