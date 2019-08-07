/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global pg_client, db */

var _ = require('underscore')
var Joi = require('joi')

var retriever = require('../retriever')
var crash = require('../crash')
var mini = require('../mini')
var common = require('./common')
const moment = require('moment')

const CRASHES_PLATFORM_VERSION = `
    SELECT TO_CHAR(FC.ymd, 'YYYY-MM-DD')                                                                       AS ymd,
           FC.platform || ' ' || FC.version                                                                    as platform,
           SUM(FC.total)                                                                                       AS count,
           ROUND(SUM(FC.total) / (SELECT SUM(total)
                                  FROM dw.fc_crashes
                                  WHERE ymd = FC.ymd AND platform = ANY ($2) AND channel = ANY ($3)), 3) *
           100                                                                                                 AS daily_percentage
    FROM dw.fc_crashes FC
    WHERE FC.ymd >= current_date - CAST($1 as INTERVAL)
      AND FC.platform = ANY ($2)
      AND FC.channel = ANY ($3)
    GROUP BY FC.ymd, FC.platform || ' ' || FC.version
    ORDER BY FC.ymd DESC, FC.platform || ' ' || FC.version
`
// ~
const CRASH_REPORTS_SIGNATURE = `

    SELECT version,
           CASE
               WHEN platform = 'linux' THEN 'linux'
               WHEN platform = 'Win64' THEN 'winx64-bc'
               WHEN platform IN ('Win32', 'win32') THEN 'winia32-bc'
               WHEN platform IN ('OS X', 'darwin') THEN 'osx-bc'
               WHEN platform = 'unknown' THEN 'unknown'
               ELSE 'unknown' END               AS platform,
           cpu,
           crash_reason,
           signature,
           sp.canonical_platform(platform, cpu) as canonical_platform,
           channel,
           SUM(total)                           AS total
    FROM dw.fc_crashes_mv
    WHERE ymd >= current_date - cast($1 AS interval)
      AND version ~ '[0-9]+\.[0-9]+\.[0-9]+'
      AND platform = ANY ($2)
      AND channel = ANY ($3)
    GROUP BY version,
             platform,
             cpu,
             crash_reason,
             signature,
             sp.canonical_platform(platform, cpu),
             channel
    HAVING SUM(total) > 10
    ORDER BY total DESC
`

const CRASH_RATIO = `
    SELECT version, chromium_version, platform, crashes, total, crashes / total AS crash_rate
    FROM (SELECT version,
                 chromium_version,
                 platform,
                 SUM(crashes) as crashes,
                 SUM(usage)   as total
          FROM dw.fc_crashes_dau_mv
          WHERE ymd >= current_date - cast($1 AS interval)
            AND platform = ANY ($2)
            AND version = COALESCE($3, version)
          GROUP BY version,
                   platform,
                   chromium_version
          HAVING SUM(usage) > 50) CR
    ORDER BY version DESC, crashes / total DESC
`

const CRASH_REPORT_DETAILS_PLATFORM_VERSION = `
    SELECT id,
           ts,
           contents ->> 'year_month_day'                                           AS ymd,
           COALESCE(contents ->> 'ver', '0.0.0')                                   AS electron_version,
           contents ->> '_version'                                                 AS version,
           contents ->> 'platform'                                                 AS platform,
           COALESCE(contents -> 'metadata' ->> 'cpu', 'Unknown')                   AS cpu,
           COALESCE(contents -> 'metadata' ->> 'crash_reason', 'Unknown')          AS crash_reason,
           COALESCE(contents -> 'metadata' ->> 'signature', 'unknown')             AS signature,
           COALESCE(contents -> 'metadata' ->> 'operating_system_name', 'Unknown') AS operating_system_name
    FROM dtl.crashes
    WHERE contents ->> 'platform' = $1
      AND contents ->> '_version' = $2
      AND sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($3 as INTERVAL)
    ORDER BY ts DESC
`

const RECENT_CRASH_REPORT_DETAILS = `
    SELECT id,
           ts,
           platform                                                                as canonical_platform,
           chromium_major_version,
           contents ->> 'year_month_day'                                           AS ymd,
           contents ->> 'ver'                                                      AS version,
           contents ->> 'channel'                                                  AS channel,
           COALESCE(contents -> 'metadata' ->> 'cpu', 'Unknown')                   AS cpu,
           COALESCE(contents ->> 'node_env', 'Unknown')                            AS node_env,
           COALESCE(contents -> 'metadata' ->> 'crash_reason', 'Unknown')          AS crash_reason,
           COALESCE(contents -> 'metadata' ->> 'signature', 'Unknown')             AS signature,
           COALESCE(contents -> 'metadata' ->> 'operating_system_name', 'Unknown') AS operating_system_name
    FROM dtl.crashes_bc
    WHERE sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($1 as INTERVAL)
      AND platform = ANY ($2)
`

const DEVELOPMENT_CRASH_REPORT_DETAILS = `
    SELECT id,
           ts,
           contents ->> 'year_month_day'                                                    AS ymd,
           COALESCE(contents ->> 'ver', '0.0.0')                                            AS electron_version,
           contents ->> '_version'                                                          AS version,
           contents ->> 'platform'                                                          AS platform,
           COALESCE(contents -> 'metadata' ->> 'cpu', 'Unknown')                            AS cpu,
           COALESCE(contents ->> 'node_env', 'Unknown')                                     AS node_env,
           COALESCE(contents -> 'metadata' ->> 'crash_reason', 'Unknown')                   AS crash_reason,
           COALESCE(contents -> 'metadata' ->> 'signature', 'Unknown')                      AS signature,
           COALESCE(contents -> 'metadata' ->> 'operating_system_name', 'Unknown')          AS operating_system_name,
           sp.canonical_platform(contents ->> 'platform', contents -> 'metadata' ->> 'cpu') AS canonical_platform
    FROM dtl.crashes
    WHERE sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($1 as INTERVAL)
      AND (COALESCE(contents ->> 'channel', 'none') <> 'dev' OR
           COALESCE(contents ->> '_version', '0.0.0') = '0.0.0' OR
           contents ->> '_version' not similar to '\\d+\\.\\d+\\.\\d+')
    ORDER BY ts DESC
    LIMIT 200
`

const CRASH_REPORT_DETAILS = `
    SELECT id,
           ts,
           contents ->> 'year_month_day'                                           AS ymd,
           COALESCE(contents ->> 'ver', '0.0.0')                                   AS electron_version,
           contents ->> '_version'                                                 AS version,
           contents ->> 'platform'                                                 AS platform,
           COALESCE(contents -> 'metadata' ->> 'cpu', 'Unknown')                   AS cpu,
           COALESCE(contents -> 'metadata' ->> 'crash_reason', 'Unknown')          AS crash_reason,
           COALESCE(contents -> 'metadata' ->> 'signature', 'unknown')             AS signature,
           COALESCE(contents -> 'metadata' ->> 'operating_system_name', 'Unknown') AS operating_system_name
    FROM dtl.crashes
    WHERE contents ->> 'platform' = $1
      AND contents ->> '_version' = $2
      AND sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($3 as INTERVAL)
      AND contents -> 'metadata' ->> 'crash_reason' = $4
      AND contents -> 'metadata' ->> 'cpu' = $5
      AND COALESCE(contents -> 'metadata' ->> 'signature', 'unknown') = $6
    ORDER BY ts DESC`

const CRASHES_PLATFORM = `
    SELECT C.contents ->> 'year_month_day' AS ymd,
           CASE
               WHEN C.contents ->> 'platform' = 'linux' THEN 'linux-bc'
               WHEN C.contents ->> 'platform' = 'Win64' THEN 'winx64-bc'
               WHEN C.contents ->> 'platform' IN ('Win32', 'win32') THEN 'winia32-bc'
               WHEN C.contents ->> 'platform' IN ('OS X', 'darwin') THEN 'osx-bc'
               WHEN C.contents ->> 'platform' = 'unknown' THEN 'unknown'
               ELSE 'unknown' END          AS platform,
           COUNT(CASE
                     WHEN C.contents ->> 'platform' = 'linux' THEN 'linux-bc'
                     WHEN C.contents ->> 'platform' = 'Win64' THEN 'winx64-bc'
                     WHEN C.contents ->> 'platform' IN ('Win32', 'win32') THEN 'winia32-bc'
                     WHEN C.contents ->> 'platform' IN ('OS X', 'darwin') THEN 'osx-bc'
                     WHEN C.contents ->> 'platform' = 'unknown' THEN 'unknown'
                     ELSE 'unknown' END)   AS count
    FROM dtl.crashes C
    WHERE sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($1 as INTERVAL)
      AND C.contents ->> 'channel' = ANY ($2)
      AND sp.canonical_platform(C.contents ->> 'platform', C.contents->'metadata'->>'cpu') = ANY ($3)
      AND C.contents->> 'ver' ~ '^[0-9]+\.[0-9]+\.[0-9]+'
      AND C.contents->>'ver' ~ '^[0-9]{1,2}\.[0-9]{1,4}\.[0-9]+'
      AND c.contents->>'ver' NOT LIKE '0.2%'
      AND C.contents->>'ver' NOT LIKE '0.3%'
      AND C.contents->>'ver' NOT LIKE '0.4%'
    GROUP BY ymd, platform
    ORDER BY ymd, platform`

// COUNT(platform) AS count
// GROUP BY C.contents->>'year_month_day', platform, C.contents->>'_version'
// ORDER BY C.contents->>'year_month_day' DESC

const CRASH_VERSIONS = `
    SELECT contents ->> '_version' AS version,
           count(1)                as total
    FROM dtl.crashes
    WHERE contents ->> '_version' IS NOT NULL
      AND sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($1 as INTERVAL)
    GROUP BY contents ->> '_version'
    ORDER BY contents ->> '_version' DESC`

const CRASH_ELECTRON_VERSIONS = `
    SELECT contents ->> 'ver' AS electron_version,
           count(1)           as total
    FROM dtl.crashes
    WHERE contents ->> 'ver' IS NOT NULL
      AND sp.to_ymd((contents ->> 'year_month_day'::text)) >= current_date - CAST($1 as INTERVAL)
    GROUP BY contents ->> 'ver'
    ORDER BY sp.comparable_version(contents ->> 'ver') DESC`

exports.setup = (server, client, mongo) => {
  // Crash reports
  server.route({
    method: 'GET',
    path: '/api/1/dc_platform',
    handler: async (request, h) => {
      let days = parseInt(request.query.days || 7, 10)
      days += ' days'
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let channels = common.channelPostgresArray(request.query.channelFilter)
      try {
        const results = await client.query(CRASHES_PLATFORM, [days, channels, platforms])
        results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
        return (results.rows)
      } catch (e) {
        return h.response(err.toString()).code(500)
      }
    }
  })

  // Crashes for a day / platform
  server.route({
    method: 'GET',
    path: '/api/1/dc_platform_detail',
    handler: function (request, h) {
      return retriever.crashesForYMDPlatform(mongo, request.query.ymd, request.query.platform, (err, results) => {
        if (err) {
          return h.response(err.toString()).code(500)
        } else {
          return (results.rows)
        }
      })
    }
  })

  // Download a crash report
  server.route({
    method: 'GET',
    path: '/download/crash_report/{id}',
    handler: function (request, h) {
      mini.readAndStore(request.params.id, (filename) => {
        console.log('Downloading ' + request.params.id + ', ' + filename)
        h.file(filename)
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_reports',
    handler: async function (request, h) {
      let days = parseInt(request.query.days || 7, 10)
      days += ' days'
      let platforms = db.Crash.mapPlatformFilters(common.platformPostgresArray(request.query.platformFilter))
      let channels = common.channelPostgresArray(request.query.channelFilter)
      try {
        let results = await client.query(CRASH_REPORTS_SIGNATURE, [days, platforms, channels])
        results.rows = results.rows.filter((c) => { return c.version.match(/^0\.[1234]+/) === null })
        return (results.rows)
      } catch (e) {
        console.log(e)
        return h.response(err.toString()).code(500)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_ratios',
    handler: async function (request, h) {
      let days = parseInt(request.query.days || 7, 10)
      days += ' days'
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let version = request.query.version || null

      try {
        const results = await pg_client.query(CRASH_RATIO, [days, platforms, version])
        results.rows.forEach((row) => {
          row.crashes = parseInt(row.crashes)
          row.total = parseInt(row.total)
          row.crash_rate = parseFloat(row.crash_rate)
        })
        return (results.rows)
      } catch (err) {
        return h.response(err.toString()).code(500)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_report_details',
    handler: function (request, h) {
      let days = parseInt(request.query.days || 7, 10)
      days += ' days'
      return client.query(CRASH_REPORT_DETAILS, [request.query.platform, request.query.version, days, request.query.crash_reason, request.query.cpu, request.query.signature], (err, results) => {
        if (err) {
          return h.response(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          return (results.rows)
        }
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_report_platform_version_details',
    handler: function (request, h) {
      let days = parseInt(request.query.days || 7, 10)
      days += ' days'
      return client.query(CRASH_REPORT_DETAILS_PLATFORM_VERSION, [request.query.platform, request.query.version, days], (err, results) => {
        if (err) {
          return h.response(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          return (results.rows)
        }
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/recent_crash_report_details',
    handler: async (request, h) => {
      try {
        let [days, platforms, channels, ref] = common.retrieveCommonParameters(request)
        let offset = parseInt(request.query.offset || 0)
        let query = RECENT_CRASH_REPORT_DETAILS
        let params = [days, platforms]
        console.log(channels.length)
        if (channels.length < 5) {
          query += `  AND contents->>'channel' = ANY ($3)`
          params.push(channels)
        }
        query += ` ORDER BY ts DESC OFFSET ${offset} LIMIT 100`
        let results = await client.query(query, params)
        return results.rows
      } catch (e) {
        console.log(e)
        return h.response(e.toString()).code(500)
      }
    }
  })

  // Default crash success handler
  const commonSuccessHandler = (results, request) => {
    results.rows.forEach((row) => common.formatPGRow(row))
    return (results.rows)
  }

  // Return an array containing a day offset i.e. ['3 days'] and a set of platforms
  const commonDaysPlatformParamsBuilder = (request) => {
    return [parseInt(request.query.days || 7) + ' days',
      common.platformPostgresArray(request.query.platformFilter)]
  }

  server.route({
    method: 'GET',
    path: '/api/1/development_crash_report_details',
    handler: common.buildQueryReponseHandler(
      client,
      DEVELOPMENT_CRASH_REPORT_DETAILS,
      (results, request) => {
        results.rows.forEach((row) => common.formatPGRow(row))
        return (results.rows)
      },
      (request) => { return [parseInt(request.query.days || 7) + ' days'] }
    )
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_report',
    handler: function (request, h) {
      var id = request.query.id
      return new Promise((resolve, reject) => {
        crash.storedCrash(client, id, (err, results) => {
          if (err) {
            reject(h.response(err.toString()).code(500))
          } else {
            resolve(results)
          }
        })
      })
    }
  })

  // Crash reports by platform / version
  server.route({
    method: 'GET',
    path: '/api/1/dc_platform_version',
    handler: function (request, h) {
      let days = parseInt(request.query.days || 7, 10)
      days += ' days'
      let platforms = common.platformPostgresArray(request.query.platformFilter)
      let channels = common.channelPostgresArray(request.query.channelFilter)
      return client.query(CRASHES_PLATFORM_VERSION, [days, platforms, channels], (err, results) => {
        if (err) {
          return h.response(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          results.rows = common.potentiallyFilterToday(results.rows, request.query.showToday === 'true')
          return (results.rows)
        }
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_versions',
    handler: async function (request, h) {
      let days = parseInt(request.query.days || 14, 10)
      days += ' days'
      let results = { rows: [] }
      try {
        results = await pg_client.query(CRASH_VERSIONS, [days])
      } catch (e) {
        console.log(e.message)
        throw e
      }
      results.rows.forEach((row) => common.formatPGRow(row))
      return (results.rows)
    }
  })

  server.route({
    method: 'GET',
    path: '/api/1/crash_electron_versions',
    handler: function (request, h) {
      let days = parseInt(request.query.days || 14, 10)
      days += ' days'
      return client.query(CRASH_ELECTRON_VERSIONS, [days], (err, results) => {
        if (err) {
          return h.response(err.toString()).code(500)
        } else {
          results.rows.forEach((row) => common.formatPGRow(row))
          return (results.rows)
        }
      })
    }
  })
}
