const pg = require('pg')
const moment = require('moment')
const _ = require('underscore')
const tt = require('text-table')

const SQL = 'select platform, sum(total)::bigint as the_total from dw.fc_usage_month where ymd >= $1 and ymd <= $2 group by platform order by platform';
const MONTHS = 4

const main = async () => {
  let connection = await pg.connect(process.env.DATABASE_URL)
  let t2 = moment()
  let t1 = moment(t2).startOf('month')
  let combined = []
  let months = []
  for (let i = 0; i < MONTHS; i++) {
    months.push(t1.format('MMM'))
    let results = _.object((await connection.query(SQL, [t1.format('YYYY-MM-DD'), t2.format('YYYY-MM-DD')])).rows.map((r) => {
      return [[r.platform], parseInt(r.the_total)]
    }))
    combined.push(results)
    t2.subtract(1, 'month')
    t1 = moment(t2).startOf('month')
  }
  console.log(JSON.stringify({
    combined,
    months
  }, null, 2))
  connection.end()
}

main()
