/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

require('../test_helper')
const Util = require('../../src/models/util').Util
const _ = require('lodash')
const moment = require('moment')

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
  describe('Math', async function () {
    describe('fuzzBy', async function () {
      it('returns a number adjusted by between 0 and the given number percent of its original value', async function () {
        const originalNumbers = _.range(0, 400).map(i => _.random(1000, 10000))
        const adjustmentPercent = 20
        const fuzzed = originalNumbers.map((n) => { return Util.Math.fuzzBy(adjustmentPercent, n)})
        for (let i in originalNumbers) {
          let fuzz = originalNumbers[i] / fuzzed[i]
          expect((fuzz < 1.2 || fuzz >= 0.8)).to.equal(true)
        }
      })
    })
    describe('lineFromYmdPoints', async function () {
      let startDate, numberOfDays, endDate, startPoint, endPoint
      beforeEach(async function () {
        startDate = moment('2018-12-12')
        startPoint = {ymd: startDate.format('YYYY-MM-DD'), count: _.random(100, 1000)}
        numberOfDays = _.random(5, 50)
        endDate = startDate.clone().add(numberOfDays, 'days')
        endPoint = {
          ymd: endDate.format('YYYY-MM-DD'),
          count: _.random(100, 1000)
        }
      })
      it('takes a set of ymd/count key value pairs and returns a set of ymd/count pairs for the same dates', async function () {
        //execution
        const outputSet = Util.Math.lineFromYmdPoints(startPoint, endPoint)

        //validation
        //does not change the start point values
        expect(_.first(outputSet)).to.have.property('ymd', startDate.format('YYYY-MM-DD'))
        expect(_.first(outputSet)).to.have.property('count', startPoint.count)
        //does not change the end point values
        expect(_.last(outputSet)).to.have.property('ymd', endDate.format('YYYY-MM-DD'))
        expect(_.last(outputSet)).to.have.property('count', endPoint.count)
        const generatedSet = _.clone(outputSet).slice(1, -1)
        for(let a of generatedSet){
          expect(a.count).to.be.a('number')
        }
        const startEndSlope = parseInt(Util.Math.ymdSlope(startPoint, endPoint))
        const slopes = _.uniq(generatedSet.map((b) => { return parseInt(Util.Math.ymdSlope(startPoint, b))}))
        expect(slopes).to.have.property('length', 1)
        expect(slopes[0]).to.equal(startEndSlope)
      })
    })
    describe('slopePoint', async function () {
      let startPoint, endPoint, intermediateYmd, daysAhead, xInQuestion
      beforeEach(async function () {
        startPoint = {
          ymd: moment().format('YYYY-MM-DD'), count: _.random(1000, 150000)
        }
        daysAhead = _.random(40, 365)
        endPoint = {
          ymd: moment().add(daysAhead, 'days').format('YYYY-MM-DD'),
          count: _.random(startPoint.count + 500, startPoint.count + 500000)
        }
        xInQuestion = _.random(1, daysAhead)
        intermediateYmd = moment().add(xInQuestion, 'days').format('YYYY-MM-DD')
      })
      it('takes a start point, end point, and intermediate date, returning a ymd/count object for the intermediateDate', async function () {
        const result = Util.Math.slopePoint(startPoint, endPoint, intermediateYmd)
        expect(result).to.have.property('ymd', intermediateYmd)
        expect(result).to.have.property('count')
        expect(result.count).to.be.a('number')
      })
      it('sets the count property to the number that matches the slope between the start point and end point', async function () {
        const slope = (a, b) => { return (b[1] - a[1]) / (b[0] - a[0])}
        const changeInY = endPoint.count - startPoint.count
        const changeInX = moment(endPoint.ymd).diff(moment(startPoint.ymd), 'days')
        expect(changeInX).to.equal(daysAhead)
        const x1 = 0
        const y1 = startPoint.count
        const m = changeInY / changeInX
        let y = m * (xInQuestion - x1) + y1
        const result = Util.Math.slopePoint(startPoint, endPoint, intermediateYmd)
        expect(result).to.have.property('ymd', intermediateYmd)
        expect(result).to.have.property('count', y)
        // slopes between start/end should be same as itermediate / end
        const startVsEndSlope = slope([0, startPoint.count], [daysAhead, endPoint.count])
        const intermediateVsEndSlope = slope([0, result.count], [(daysAhead - xInQuestion), endPoint.count])
        expect(parseInt(startVsEndSlope)).to.equal(parseInt(intermediateVsEndSlope))
      })
    })
    describe('ymdSlope', async function () {
      it('returns the slope for two ymd points', async function () {
        const startDate = moment()
        const a = {
          ymd: startDate.format('YYYY-MM-DD'),
          count: _.random(100, 10000)
        }
        const daysForward = _.random(10, 200)
        const endDate = startDate.clone().add(daysForward, 'days')
        const b = {
          ymd: endDate.format('YYYY-MM-DD'),
          count: _.random(100, 10000)
        }
        const slope = Util.Math.ymdSlope(a, b)
        const changeInY = b.count - a.count
        const changeInX = moment(b.ymd).diff(moment(a.ymd), 'days')
        const m = changeInY / changeInX
        expect(slope).to.equal(m)
      })
    })
  })
})
