const pgc = require('../src/pgc')
const protobuf = require('protobufjs')
const fs = require('fs')
const moment = require('moment')

const AWS = require('aws-sdk')
AWS.config.region = process.env.P3A_REGION

const sts = new AWS.STS()

const configureAWS = async () => {
  console.log(process.env.P3A_ROLE)
  return new Promise((resolve, reject) => {
    const sts = new AWS.STS()
    sts.assumeRole({
      RoleArn: process.env.P3A_ROLE,
      RoleSessionName: 'awssdk'
    }, (err, data) => {
      if (err) {
        console.log('Cannot assume role')
        return reject(err)
      } else {
        AWS.config.update({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
          region: process.env.P3A_REGION
        })
        return resolve()
      }
    })
  })
}

const listBucketContents = async (lastKey) => {
  return new Promise ((resolve, reject) => {
    let s3 = new AWS.S3()
    const s3params = {
      Bucket: process.env.P3A_SOURCE_LOGS_BUCKET,
      MaxKeys: 1000,
      Delimiter: '/'
    }
    if (lastKey) {
      s3params.StartAfter = lastKey
    }
    s3.listObjectsV2(s3params, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

const databaseConnection = async () => {
  return await pgc.setupConnection()
}

const retrieveLogFromS3 = async (summary) => {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3()
    s3.getObject({
      Bucket: process.env.P3A_SOURCE_LOGS_BUCKET,
      Key: summary.Key
    }, (err, res) => {
      if (err) return reject(err)
      return resolve(res.Body)
    })
  })
}

const retrieveLastkey = async (client) => {
  const results = await client.query(`SELECT last_key FROM dw.p3a_state WHERE id = 'log'`, [])
  if (results.rows.length > 0) {
    return results.rows[0].last_key
  } else {
    return null
  }
}

const markSummaryIngested = async (log, client) => {
  await client.query(`INSERT INTO dw.p3a_state (id, last_key) values ('log', $1) on conflict (id) do update set last_key = $1`, [log.Key])
}

const loadLogs = async (logs, client) => {
  let cnt = 0
  for (let log of logs) {
    console.log(cnt)
    const obj = await retrieveLogFromS3(log)
    await increment(client, obj)
    await markSummaryIngested(log, client)
    cnt += 1
  }
  return cnt
}

const increment = async (client, obj) => {
  let tokens
  try {
    let contents = obj.toString()
    tokens = contents.split(' ')
    if (tokens[tokens.length - 2] == '200' && !tokens[tokens.length - 1].match(/null/)) {
      contents = new Buffer(tokens[tokens.length - 1].replace(/'/g, ''), 'base64')
      const msg = protoType.decode(contents)
      const decoded = decodeAttributes(msg.metricId.toString(16), msg.p3aInfo)
      console.log(decoded)
      decoded.country_code = decoded.country_code || 'unknown'
      await client.query('INSERT INTO dw.p3a_logs (wos, woi, platform, channel, ref, country_code, version, metric_id, metric_value, total) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1) on conflict (wos, woi, platform, channel, ref, country_code, version, metric_id, metric_value) do update set total = dw.p3a_logs.total + 1',
        [decoded.wos, decoded.woi, decoded.platform, decoded.channel, decoded.ref, decoded.countryCode, decoded.version, decoded.bucketId, decoded.bucketValue]
      )
    } else {
      //console.log("Not a 200 or contains a null payload - Skipping")
    }
  } catch (e) {
    console.log(e)
    console.log("Error - Skipping", tokens)
  }

}

const decodeAttributes = (bucketId, s) => {
  const tokens = s.toString().split(',')
  let woi = tokens[5]
  let wos = tokens[6]
  return {
    countryCode: tokens[1],
    platform: tokens[2],
    version: tokens[3],
    channel: tokens[4],
    ref: tokens[7],
    woi: moment().day('monday').year('20' + woi.substring(0, 2)).week(woi.substring(2, 4)).format('YYYY-MM-DD'),
    wos: moment().day('monday').year('20' + wos.substring(0, 2)).week(wos.substring(2, 4)).format('YYYY-MM-DD'),
    bucketId: bucketId,
    bucketValue: tokens[8].replace(/[^0-9]+$/, '')
  }
}

let protoType
const loadProtoMessageDefinition = async () => {
  const protoRoot = await protobuf.load(process.env.PROTOBUFFER_DEFINITION || './bin/proto/prochlo_message.proto')
  protoType = protoRoot.lookupType('brave_pyxis.RawP3AValue')
}

const main = async () => {
  let client
  try {
    await configureAWS()
    await loadProtoMessageDefinition()
    client = await databaseConnection()
    let lastKey = await retrieveLastkey(client)
    while (true) {
      console.log(`lastKey = ${lastKey}`)
      const contents = await listBucketContents(lastKey)
      if (contents.Contents.length === 0) break
      const results = await loadLogs(contents.Contents, client)
      console.log(results)
      lastKey = await retrieveLastkey(client)
    }
  } catch (err) {
    console.log(err, err.stack)
  } finally {
    await client.end()
  }
}

main()
