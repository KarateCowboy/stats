/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {setWorldConstructor} = require('cucumber')
const webdriver = require('webdriverio')

class CustomWorld {
  constructor () {

    this.adminPassword = 'SOME_TEST_PASSWORD'
    this.sessionSecret = 'SUPER_SECRET_SESSION_SALT_THAT_IS_LONG'
    process.env.SESSION_SECRET = this.sessionSecret
    process.env.ADMIN_PASSWORD = this.adminPassword
    const options = {desiredCapabilities: {browserName: 'chrome'}}
    global.browser = webdriver.remote(options)
  }

  setTo (variable, number) {
    this[variable] = number
  }

  incrementBy (number) {
    this.variable += number
  }
}

setWorldConstructor(CustomWorld)

