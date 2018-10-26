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
    return Math.floor(Math.random() * Math.floor(max))
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
}

module.exports.Util = Util