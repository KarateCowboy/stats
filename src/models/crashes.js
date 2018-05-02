/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment')
const FTI = require('./fti')

class Crashes {

  static async archive (months = 1) {
    const cutoff = moment().subtract(months, 'months').format('YYYY-MM-DD')
    const GET_OLD_CRASHES = `SELECT id, ts, contents, github_repo, github_issue_number FROM dtl.crashes WHERE ts < $1 LIMIT 10000`
    let results = await pg.query(GET_OLD_CRASHES, [cutoff])
    let transferred = 0
    let keepProcessing = true
    while (keepProcessing) {
      for (let row of results.rows) {
        const INSERT = `INSERT INTO dtl.crashes_archive (id, ts, contents, github_repo, github_issue_number) VALUES 
        ($1,$2,$3,$4,$5)`
        try {
          const values = [row.id, row.ts, row.contents, row.github_repo, row.github_issue_numebr]
          await pg.query(INSERT, values)
          await pg.query(`DELETE FROM dtl.crashes WHERE id = '${row.id}'`)
          if (row.object_id !== undefined) {
            await FTI.archive(row.object_id)
          }
          transferred++
        } catch (e) {
          if(e.message.includes('violates unique constraint "crashes_archive_pkey"') === false){
            console.log(`Error on crash id: ${row.id}:
            ${e.message}`)
          }
        }
      }
      results = await pg.query(GET_OLD_CRASHES, [cutoff])
      keepProcessing = results.rows.length > 0
    }
    console.log(`Finished archiving crashes before ${cutoff}. ${transferred} crashes transferred`)

    await pg.close()
  }
}

module.exports = Crashes
