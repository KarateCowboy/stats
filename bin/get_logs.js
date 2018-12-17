const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const Knex = require('knex')
const mongoose = require('mongoose')
const _ = require('underscore')
const commander = require('commander')
const Sequelize = require('sequelize')
const moment = require('moment')
let DownloadsService = require('../src/services/downloads.service')
commander.option('-d --day [string]', 'Days to go back', moment().subtract(1, 'days').format('YYYY-MM-DD')).parse(process.argv)

const main = async (day) => {
  const dayPrefix = moment().subtract(day,'days').format('YYYY-MM-DD')
  await connect()
  const S3 = new AWS.S3({})
  const download_logs_bucket = 'brave-download-logs'
  const downloadsService = new DownloadsService(download_logs_bucket, S3, dayPrefix)
  await downloadsService.getObjectListForDay()
  await downloadsService.loadObjectsFromList()
  console.log(`done loading day ${dayPrefix}`)
  process.exit()
}

const connect = async function () {
  global.sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false })
  AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-east-1',
    sslEnabled: true
  })
  await mongoose.connect(process.env.MLAB_URI)
  console.log('configured AWS')
}

main(commander.day)
