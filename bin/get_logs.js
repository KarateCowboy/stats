const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const Knex = require('knex')
const request = require('request')
const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client')
const Rest = require('@feathersjs/rest-client')
const _ = require('underscore')
const commander = require('commander')
const moment = require('moment')
let numbers_host, numbers_port, numbers_user, numbers_pwd, numbers_app
let DownloadsService = require('../src/services/downloads.service')
commander.option('-d --day [string]', 'Days to go back', moment().subtract(1, 'days').format('YYYY-MM-DD')).parse(process.argv)

const main = async (day) => {
  const dayPrefix = day
  await validate_env()
  numbers_app = feathers()
  const rest_client = Rest('http://' + numbers_host + ':' + numbers_port)
  numbers_app.configure(rest_client.request(request))
  numbers_app.configure(auth())
  await connect()
  const S3 = new AWS.S3({})
  const download_logs_bucket = 'brave-download-logs'
  const downloadsService = new DownloadsService(download_logs_bucket, S3, dayPrefix, numbers_app)
  await downloadsService.getObjectListForDay()
  await downloadsService.loadObjectsFromList()
  console.log(`done loading day ${dayPrefix}`)
}

const validate_env = async function () {
  if (!process.env.NUMBERS_HOST) {
    throw new Error('NUMBERS_HOST must be set in environment')
  } else {
    numbers_host = process.env.NUMBERS_HOST || 'localhost'
  }
  if (!process.env.NUMBERS_PORT) {
    throw new Error('NUMBERS_PORT must be set in environment')
  } else {
    numbers_port = process.env.NUMBERS_PORT
  }
  if (!process.env.NUMBERS_USER) {
    throw new Error('NUMBERS_USER must be set in environment')
  } else {
    numbers_user = process.env.NUMBERS_USER
  }
  if (!process.env.NUMBERS_PWD) {
    throw new Error('NUMBER_PWD must be set in environment')
  } else {
    numbers_pwd = process.env.NUMBERS_PWD
  }
  if (!process.env.NUMBERS_JWT && !process.env.LOCAL) {
    throw new Error('NUMBERS_JWT must be set in environment')
  } else {
    numbers_jwt = process.env.NUMBERS_JWT
  }

}

const connect = async function () {
  try {
    const res = await numbers_app.authenticate({
      strategy: 'local',
      email: process.env.NUMBERS_USER,
      password: process.env.NUMBERS_PWD
    })
    console.log(`Connected to Numbers at ${numbers_host}:${numbers_port}`)
  } catch (e) {
    console.log(e.message)
    process.exit()
  }
  AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-east-1',
    sslEnabled: true
  })
  global.knex = await Knex({
    client: 'pg',
    connection: process.env.DATABASE_URL
  })
  console.log('configured AWS')

}

main(commander.day)
