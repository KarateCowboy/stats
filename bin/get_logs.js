const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const FS = require('fs-extra')
const request = require('request')
const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client')
const Rest = require('@feathersjs/rest-client')
const _ = require('underscore')
  let numbers_host, numbers_port, numbers_user, numbers_pwd, numbers_app

const main = async () => {
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
    Prefix: '2018'
  }

  // Retrieve list of log files, parse them and return records as
  // an array of objects
  let objects = []
  let toLoad = []
  console.log('getting data')
  let data = await S3.listObjects(params).promise() //, data, (err, data) => { if (err) return reject() resolve(data.Contents)
  while (data.Contents.length > 0 && objects.length < 50000000) {
    console.log(objects.length)
    objects = objects.concat(data.Contents)
    toLoad = objects.concat(data.Contents)
    params.Marker = _.last(data.Contents).Key
    data = await S3.listObjects(params).promise()
    if (toLoad.length > 1000) {
      let count = 0
      await Promise.all(toLoad.map(async (file) => {
        let object
        try {
          object = await  S3.getObject({Bucket: 'brave-download-logs', Key: file.Key}).promise()
          let str = object.Body.toString()
          // await FS.appendFile('./results2.txt', bodies.join('\n'), 'utf8')
          await numbers_app.service('downloads').create({rawString: str})
          console.log('.')
        } catch (e) {
          console.log(`error on ${object.Body.toString()}`)
          console.log(e.message)
        }
        count++
        if (count % 10000 === 0) {
          console.log(count)
        }
      }))
      toLoad = []
      console.log(`${count} total records written`)
    }
  }
  const bodies = []
}

const validate_env = async function(){
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

const connect = async function(){
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
  console.log('configured AWS')

}



main()
