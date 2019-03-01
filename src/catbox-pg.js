const TBL = 'svr.sessions'
const TTL = 3 * 24 * 60 * 60 * 1000
const DEBUG = process.env.CATBOX_DEBUG || null

module.exports.setup = (server, runtime) => {
  return {
    start: (cb) => {
      cb()
    },
    stop: () => {
      // noop
    },
    isReady: () => { return true },
    validateSegmentName: (name) => {
      return null
    },
    get: async (k) => {
      const results = await runtime.db.query('SELECT * FROM ' + TBL + ' WHERE id = $1', [k])
      if (results.rows.length > 0) {
        let row = results.rows[0]
        row.stored = parseInt(row.stored)
        row.ttl = parseInt(row.ttl)
        if ((new Date().getTime()) > (row.stored + row.ttl)) {
          await runtime.db.query('DELETE FROM ' + TBL + ' WHERE id = $1', [k])
          return null
        } else {
          return results.rows[0].item
        }
      } else {
        return null
      }
    },
    set: async (k, v, ttl) => {
      ttl = ttl || TTL
      await runtime.db.query('INSERT INTO ' + TBL + ' (id, item, stored, ttl) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET item = EXCLUDED.item, stored = EXCLUDED.stored, ttl = EXCLUDED.ttl', [k, v, (new Date()).getTime(), ttl])
    },
    drop: async (k) => {
      await runtime.db.query('DELETE FROM ' + TBL + ' WHERE id = $1', [k])
    }
  }
}
