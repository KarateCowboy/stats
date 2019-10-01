exports.config = {
  tests: './test/codecept/*_test.js',
  output: './output',
  plugins: {
    wdio: {
      enabled: true,
      services: ['selenium-standalone']
    }
  },
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
    I: './test/steps_file.js'
  },
  bootstrap: null,
  mocha: {},
  name: 'stats'
}
