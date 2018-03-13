const {setWorldConstructor} = require('cucumber')
const webdriver = require('webdriverio')

class CustomWorld {
  constructor () {

    this.adminPassword = 'SOME_TEST_PASSWORD'
    this.sessionSecret = 'SUPER_SECRET_SESSION_SALT_THAT_IS_LONG'
    const options = {desiredCapabilities: {browserName: 'chrome'}}
    global.browser = webdriver.remote(options)
  }

  setTo (number) {
    this.variable = number
  }

  incrementBy (number) {
    this.variable += number
  }
}

setWorldConstructor(CustomWorld)

