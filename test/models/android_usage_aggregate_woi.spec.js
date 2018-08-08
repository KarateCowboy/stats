/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const AndroidUsageAggregateWOI = require('../../src/models/android_usage_aggregate_week')

describe('AndroidUsageAggregateWOI', function () {
  describe('#scrub', function(){
    it('changes the platform from "android" to "androidbrowser"', async function(){
      //setup
      const bad_platform = await factory.build('android_usage_aggregate_woi')
      //execution
      const scrubbed_record = AndroidUsageAggregateWOI.scrub(bad_platform)
      //validation
      expect(scrubbed_record._id.platform).to.equal('androidbrowser')
    })
  })
})
