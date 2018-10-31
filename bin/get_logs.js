const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const Knex = require('knex')
const FS = require('fs-extra')
const request = require('request')
const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client')
const Rest = require('@feathersjs/rest-client')
const _ = require('underscore')
const commander = require('commander')
const moment = require('moment')
let numbers_host, numbers_port, numbers_user, numbers_pwd, numbers_app
commander.option('-d --day [num]', 'Days to go back', 90)

let latest_key_for_ymd = async function (ymd) {
  const latest_key = knex('dw.downloads').whereRaw(`key LIKE '%${ymd}%' `).orderBy('created_at', 'desc').limit(1).toString()
  const result = await knex.raw(latest_key)
  if (result.rows.length === 1) {
    return result.rows[0].key
  } else {
    return undefined
  }
}

const main = async (day) => {
  const dayPrefix = moment().subtract(day, 'days').format('YYYY-MM-DD')
  await validate_env()
  numbers_app = feathers()
  const rest_client = Rest('http://' + numbers_host + ':' + numbers_port)
  numbers_app.configure(rest_client.request(request))
  numbers_app.configure(auth())
  await connect()
  const S3 = new AWS.S3({})
  const download_logs_bucket = 'brave-download-logs'
  const params = {
    Bucket: download_logs_bucket,
    MaxKeys: 2000000000,
    Prefix: dayPrefix,
  }

  let latest_key = await latest_key_for_ymd(dayPrefix)
  if (latest_key) {
    params.Marker = latest_key
  }

  // Retrieve list of log files, parse them and return records as
  // an array of objects
  let objects = []
  let toLoad = []
  console.log('getting data')
  let data = await S3.listObjects(params).promise() //, data, (err, data) => { if (err) return reject() resolve(data.Contents)
  let count = 0
  while (data.Contents.length > 0 && objects.length < 50000000) {
    objects = objects.concat(data.Contents)
    toLoad = toLoad.concat(data.Contents)
    params.Marker = _.last(data.Contents).Key
    data = await S3.listObjects(params).promise()
    if (toLoad.length > 1000) {
      await Promise.all(toLoad.map(async (file) => {
        let object
        try {
          const exists = await knex('dw.downloads').where({key: file.Key}).count()
          if (Number(exists[0].count) === 0) {
            object = await  S3.getObject({Bucket: 'brave-download-logs', Key: file.Key}).promise()
            let str = object.Body.toString()
            await numbers_app.service('downloads').create({rawString: str, key: file.Key})
          }
        } catch (e) {
          if (!!!e.message.match(/duplicate/)) {
            // console.log(`error on ${object.Body.toString()}`)
            console.log(`Problem: ${e.message}`)
          }
        }
        count++
        if (count % 10000 === 0) {
          console.log(count)
        }
      }))
      toLoad = []
    }
  }
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
    console.log('stuff')
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
