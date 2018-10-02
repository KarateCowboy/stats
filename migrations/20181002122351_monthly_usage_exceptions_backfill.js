/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const backfillData = [
  ['2018-09-12', 9536],
  ['2018-09-13', 14436],
  ['2018-09-14', 15522],
  ['2018-09-15', 19298],
  ['2018-09-16', 11312],
  ['2018-09-17', 12724],
  ['2018-09-18', 17312],
  ['2018-09-19', 14274],
  ['2018-09-20', 9917],
  ['2018-09-21', 10055],
  ['2018-09-22', 12590],
  ['2018-09-23', 13712],
  ['2018-09-24', 23115],
  ['2018-09-25', 29479],
  ['2018-09-26', 20156],
]
exports.up = async function (knex, Promise) {
  for(let row of backfillData){
    await knex('dw.fc_usage_month_exceptions').insert({
      ymd: row[0],
      total: row[1],
      channel: 'stable',
      platform: 'androidbrowser',
      version: '1.0.5901',
      ref: 'none'
    })

  }
}

exports.down = async function (knex, Promise) {
  for(let row of backfillData){
    await knex('dw.fc_usage_month_exceptions').where({
      ymd: row[0],
      total: row[1],
      channel: 'stable',
      platform: 'androidbrowser',
      version: '1.0.5901',
      ref: 'none'
    }).delete()
  }
}
