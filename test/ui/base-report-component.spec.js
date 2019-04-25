const _ = require('lodash')
const expect = require('chai').expect
const BaseReportComponent = require('../../src/ui/base-report-component')
const Application = require('../../src/ui/application')

describe('BaseReportComponent', async function () {
  let report
  beforeEach(function () {
    report = new BaseReportComponent()
  })
  it('has a menuConfig', function () {
    expect(report).to.have.property('menuConfig')
    expect(report.menuConfig).to.have.property('showControls', true)
    expect(report.menuConfig).to.have.property('showShowToday', true)
    expect(report.menuConfig).to.have.property('showRefFilter', true)
    expect(report.menuConfig).to.have.property('showDaysSelector', true)
    expect(report.menuConfig).to.have.property('showCountryCodeFilter', true)
    expect(report.menuConfig).to.have.property('showWOISFilter', true)
  })
  it('has a retriever', function () {
    expect(_.isFunction(report.retriever)).to.equal(true, 'must have a retriever method')
  })
  it('has a handler', function () {
    expect(_.isFunction(report.handler)).to.equal(true, 'must have a handler method')
  })
  it('has a title', function () {
    expect(report).to.have.property('title', 'Basic Report')
  })
  it('has a subtitle', function () {
    expect(report).to.have.property('subtitle', 'Subtitle for basic report')
  })
  it('has a path', function () {
    expect(report).to.have.property('path', 'basic_report_path')
  })
  it('has a menu title', function () {
    expect(report).to.have.property('menuTitle', 'Basic Report Menu Title')
  })
  it('has a menu id', function () {
    expect(report).to.have.property('menuId', 'basicReportId')
  })
  it('has reportContent', function () {
    expect(report).to.have.property('reportContent', '<marquee>hello, Brave new world</marquee>')
  })
  it('has a contentTag', function () {
    expect(report).to.have.property('contentTagId', 'usageContent')
  })
  it('has a parent app', async function () {
    expect(report).to.have.property('app')
  })
  describe('buildSuccessHandler', function () {
    it('accepts x, y, x_label, y_label, opts, and returns a handler function', function () {
      const result = BaseReportComponent.buildSuccessHandler()
      expect(_.isFunction(result)).to.equal(true, 'should return a function')
    })
  })
})