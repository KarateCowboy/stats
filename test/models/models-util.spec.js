const expect = require('chai').expect
const DbUtil = require('../../src/models')
const sinon = require('sinon')
const fs = require('fs-extra')
describe('models util', async function () {
  describe('#init', async function () {
    it('takes postgres & mongo connection strings', async function () {
      let db = new DbUtil(process.env.TEST_DATABASE_URL, process.env.TEST_MLAB_URI)
      expect(db).to.have.property('pgConnectionString', process.env.TEST_DATABASE_URL)
      expect(db).to.have.property('mongoConnectionString', process.env.TEST_MLAB_URI)
    })
    it('has a list of pg models', async function () {
      const dirContents = [
        'user.pgmodel.js',
        'misplaced.txt'
      ]
      sinon.stub(fs, 'readdirSync').returns(dirContents)
      let db = new DbUtil(process.env.TEST_DATABASE_URL, process.env.TEST_MLAB_URI)
      expect(db.pgFiles).to.contain('user.pgmodel.js')
      expect(db.pgFiles).to.not.contain('misplaced.txt')
      fs.readdirSync.restore()
    })
  })
  describe('#pgModels', async function () {
    it('returns only pgmodel.js files', async function () {
      const dirContents = [
        'user.pgmodel.js',
        'usage.mongomodel.js',
        'misplaced.txt'
      ]
      let db = new DbUtil(process.env.TEST_DATABASE_URL, process.env.TEST_MLAB_URI)
      const results = db.pgModelsFilter(dirContents)
      expect(results).to.include(dirContents[0])
      expect(results).to.have.property('length', 1)
    })
  })
})