const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(null)
const FS = require('fs-extra')

const main = async () => {
  const aws_access_key_id = 'AKIAJHU6T5PPVFM22HFA'
  const key = 'jhjizB6aKE1EJ5PLP4kKwslF5McBHw/O4E+x8OVd'
  AWS.config.update({
    accessKeyId: aws_access_key_id,
    secretAccessKey: key,
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
  let data = await S3.listObjects(params).promise() //, data, (err, data) => { if (err) return reject() resolve(data.Contents)
  console.log(data.Contents.length + ' files to process')
  await FS.appendFile('./sample_list_objects.txt', JSON.stringify(data), 'utf8')

  let count = 0
  for (let file of data.Contents) {
    let object = await  S3.getObject({Bucket: 'brave-download-logs', Key: file.Key}).promise()
    await FS.appendFile('./results.txt', object.Body.toString(), 'utf8')
    count++
  }
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
