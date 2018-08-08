/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Util = require('../../src/models/util').Util
require('../test_helper')

describe('Model Util', async function () {
  describe('#fix_date_string', function () {
    it('fixes single digit months', function () {
      const bad_date = '2018-1-02'
      const fixed_date = Util.fix_date_string(bad_date)
      expect(fixed_date).to.equal('2018-01-02')
    })
    it('fixes single digit days', function () {
      const bad_date = '2018-01-2'
      const fixed_date = Util.fix_date_string(bad_date)
      expect(fixed_date).to.equal('2018-01-02')
    })
  })
  describe('#is_valid_date_string', function () {
    it('returns true if valid', function () {
      expect(Util.is_valid_date_string('2018-03-01')).to.equal(true)
    })
    it('returns false if date is not standard', function () {
      expect(Util.is_valid_date_string('2018-03-1')).to.equal(false)
      expect(Util.is_valid_date_string('2018-3-01')).to.equal(false)
      expect(Util.is_valid_date_string('2018-3-1')).to.equal(false)
    })
  })
})
