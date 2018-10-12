const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const FS = require('fs-extra')
const request = require('request')
const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client')
const Rest = require('@feathersjs/rest-client')
const _ = require('underscore')

const main = async () => {
  const aws_access_key_id = 'AKIAJHU6T5PPVFM22HFA'
  let numbers_host, numbers_port, numbers_user, numbers_pwd
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
  // const numbers_app = feathers()
  // const rest_client = Rest('http://' + numbers_host + ':' + numbers_port)
  // numbers_app.configure(rest_client.request(request))
  // numbers_app.configure(auth())
  // try {
  //   const res = await numbers_app.authenticate({
  //     strategy: 'local',
  //     email: process.env.NUMBERS_USER,
  //     password: process.env.NUMBERS_PWD
  //   })
  // } catch (e) {
  //   console.log('stuff')
  //   console.log(e.message)
  //   process.exit()
  // }
  const key = 'jhjizB6aKE1EJ5PLP4kKwslF5McBHw/O4E+x8OVd'
  AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-east-1',
    sslEnabled: true
  })
  const S3 = new AWS.S3({})
  const download_logs_bucket = 'brave-download-logs'

  const params = {
    Bucket: download_logs_bucket,
    // Prefix: `${key}/${prefix}`
    MaxKeys: 2000000000,
    Prefix: '2018'
  }

  // Retrieve list of log files, parse them and return records as
  // an array of objects
  let objects = []
  let data = await S3.listObjects(params).promise() //, data, (err, data) => { if (err) return reject() resolve(data.Contents)
  while (data.Contents.length > 0 && objects.length < 50000) {
    objects = objects.concat(data.Contents)
    params.Marker = _.last(data.Contents).Key
    await FS.appendFile('./sample_list_objects.txt', JSON.stringify(data.Contents), 'utf8')
    data = await S3.listObjects(params).promise()
  }
  console.log(objects.length + ' files to process')
  const bodies = []

  let count = 0

  await Promise.all(objects.map(async (file) => {
    let object
    try {
      object = await  S3.getObject({Bucket: 'brave-download-logs', Key: file.Key}).promise()
      bodies.push(object.Body.toString())
      // await numbers_app.service('downloads').create({rawString: body})
    } catch (e) {
      console.log(`error on ${object}`)
      console.log(e.message)
    }
    // console.log(body)
    // console.log('##########################################')
    count++
    if (count % 10000 === 0) {
      console.log(count)
    }
  }))
  await FS.appendFile('./results2.txt', bodies.join('\n'), 'utf8')
  console.log(`${count} total records written`)
  // S3.getObject()
  // var funcs = data.Contents.map(function (contents, i) {
  //   return makeDownloader(contents.Key, Math.round(i / data.Contents.length * 100))
  // })
  // async.series(funcs, function (asyncError, results) {
  //   done(asyncError, logParser.parseContents(allRecords, match))
  // })

}

main()
