// const pgd = require('pg')

let FIND_BY_OBJECT_ID = `SELECT * FROM dtl.fti WHERE object_id = $1 LIMIT 1`
let INSERT_INTO_ARCHIVE = `INSERT INTO dtl.fti_archive (id,object_type, object_id, searchable) VALUES($1,$2.$3,$4)`
let DELETE_BY_OBJECT_ID = `DELETE FROM dtl.fti WHERE object_id = $1`

class FTI {

  static async archive (object_id) {
    // const pg = await pgd.connect(process.env.DATABASE_URL)
    try {
      const fti = await pg.query(FIND_BY_OBJECT_ID, object_id).rows[0]
      await pg.query(INSERT_INTO_ARCHIVE, [fit.id, fti.object_type, fti.object_id, fti.searchable])
      await pg.query(DELETE_BY_OBJECT_ID, [object_id])
    } catch (e) {
      console.log(`Error archiving fti ${object_id}
         ${e.message}`)
    }
  }

}

module.exports = FTI