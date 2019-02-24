/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const moment = require('moment')
const _ = require('underscore')

class Util {
  static fix_date_string (date_string) {
    if (date_string.match(/[\d]{4,4}-[\d]{1,1}-/)) {
      const temp = date_string.split('')
      temp.splice(5, 0, '0')
      date_string = temp.join('')
    }
    if (date_string.match(/[\d]{4,4}-[\d]{2,2}-[\d]{1,1}$/)) {
      const temp = date_string.split('')
      temp.splice(8, 0, '0')
      date_string = temp.join('')
    }
    return date_string
  }

  static is_valid_date_string (date_string) {
    return !!date_string.match(/^[\d]{4,4}-[\d]{2,2}-[\d]{2,2}$/)
  }

  static random_int (max) {
    return Math.floor(Math.random() * Math.floor(max - 1)) + 1
  }

  static last_ninety_days () {
    return _.range(1, 91).map((n) => { return moment().subtract(n, 'days')})
  }

  static ninety_days_ago () {
    return moment().subtract(90, 'days')
  }

  static days_going_back (count) {
    return _.range(0, count + 1).map((i) => moment().subtract(i, 'days'))
  }

  static get Math () {
    return math
  }

}

class math {
  static ymdSlope (a, b) {
    const changeInY = b.count - a.count
    const changeInX = moment(b.ymd).diff(moment(a.ymd), 'days')
    const m = changeInY / changeInX
    return m
  }

  static fuzzBy (percent, num) {
    const selectedPercent = _.random(0, percent)
    const diff = num * (selectedPercent / 100)
    const add = _.shuffle([true, false]).pop()
    return add ? num + diff : num - diff
  }

  static lineFromYmdPoints (startPoint, endPoint) {
    const startDate = moment(startPoint.ymd)
    const endDate = moment(endPoint.ymd)
    const workingDate = startDate.clone().add(1, 'days')
    const set = [startPoint]
    while (workingDate.isBefore(endDate)) {
      const newPoint = this.slopePoint(startPoint, endPoint, workingDate.format('YYYY-MM-DD'))
      set.push(newPoint)
      workingDate.add(1, 'days')
    }
    set.push(endPoint)
    return set
  }

  static slopePoint (startPoint, endPoint, intermediateYmd) {
    const changeInY = endPoint.count - startPoint.count
    const changeInX = moment(endPoint.ymd).diff(moment(startPoint.ymd), 'days')
    const x1 = 0
    const y1 = startPoint.count
    const x = moment(intermediateYmd).diff(moment(startPoint.ymd), 'days')
    const m = changeInY / changeInX
    let y = m * (x - x1) + y1
    return {
      ymd: intermediateYmd,
      count: y
    }
  }

}

module.exports.Util = Util