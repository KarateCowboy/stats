const pg = require('pg')
const moment = require('moment')
const _ = require('underscore')
const tt = require('text-table')
const numeral = require('numeral')

const args = require('yargs')
  .default('days', 7)
  .default('latest', moment().format('YYYY-MM-DD'))
  .default('type', 'daily')
  .default('threshold', 1)
  .argv

console.log(args)

const tableMappings = {
  daily: {
    old: 'dw.fc_usage',
    agg: 'dw.fc_agg_usage_daily'
  },
  monthly: {
    old: 'dw.fc_usage_month',
    agg: 'dw.fc_agg_usage_monthly'
  }
}

const main = async () => {
  const db = await pg.connect(process.env.DATABASE_URL)
  let di = 0
  let cd = moment(args.latest)
  let oldTableName = tableMappings[args.type].old
  let aggTableName = tableMappings[args.type].agg

  let buffer = []
  while (di < args.days) {
    console.log(cd.format('YYYY-MM-DD'))
    let old = await db.query(`SELECT platform, SUM(total) FROM ${oldTableName} WHERE ymd = $1 AND channel IN ('release', 'dev', 'stable') GROUP BY platform`, [cd.format('YYYY-MM-DD')])
    let n = await db.query(`SELECT platform, SUM(total) FROM ${aggTableName} WHERE ymd = $1 AND channel IN ('release', 'dev', 'stable') GROUP BY platform`, [cd.format('YYYY-MM-DD')])

    _.each(old.rows, (row) => {
      let newRow = _.find(n.rows, (r) => { return r.platform === row.platform })
      let oldValue = parseInt(row.sum)
      let newValue = parseInt(newRow.sum)
      let variance = (newValue - oldValue) / oldValue * 100
      if (variance > args.threshold) {
        buffer.push([cd.format('YYYY-MM-DD'), row.platform, numeral(oldValue).format('0,000'), numeral(newValue).format('0,000'), numeral(variance).format('0.000')])
      }
    })

    cd = cd.clone().subtract(1, 'day')
    di += 1
  }

  console.log(tt(buffer, { align: ['l', 'l', 'r', 'r', 'r'] }))

  await db.end()
}

main(args)
