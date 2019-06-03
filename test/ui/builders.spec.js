const {expect} = require('chai')
const {round, td, ptd, th, tr, st, st1, st3, stp, b, std} = require('../../src/ui/builders')

describe('Home-cooked HTML building functions', function () {
  specify('round', function () {
    expect(round).to.be.a('function')
  })
  specify('td', function () {
    expect(td).to.be.a('function')
  })
  specify('ptd', function () {
    expect(ptd).to.be.a('function')
  })
  specify('th', function () {
    expect(th).to.be.a('function')
  })
  specify('tr', function () {
    expect(tr).to.be.a('function')
  })
  specify('st', function () {
    expect(st).to.be.a('function')
  })
  specify('st1', function () {
    expect(st1).to.be.a('function')
  })
  specify('st3', function () {
    expect(st3).to.be.a('function')
  })
  specify('stp', function () {
    expect(stp).to.be.a('function')
  })
  specify('b', function () {
    expect(b).to.be.a('function')
  })
  specify('std', function () {
    expect(std).to.be.a('function')
  })
})