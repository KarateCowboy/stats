exports.config = {
  tests: './test/codecept/*_test.js',
  output: './output',
  helpers: {
    WebDriver: {
      url: 'http://localhost:8193',
      browser: 'chrome'
    },
    StartServer: {
      require: './test/codecept/startserver_helper.js'
    }
  },
  include: {
    I: './steps_file.js'
  },
  bootstrap: null,
  mocha: {},
  name: 'stats'
}
