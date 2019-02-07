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
    const options = {desiredCapabilities: {browserName: 'chrome', chromeOptions: {args: ['--headless']}}}
    global.browser = webdriver.remote(options)
  }

  setTo (variable, value) {
    this[variable] = value
  }

  get menuHelpers () {
    return {
      async addToRefBox (text) {
        await browser.pause(50)
        await browser.click('.select2-search__field')
        await browser.pause(50)
        await browser.keys(text)
        await browser.pause(50)
        await browser.keys('\uE007')
        await  browser.pause(100)
        await browser.click('#contentTitle')// remove from focus
      },
      async pickDaysBack (days) {
        await browser.pause(30)
        await browser.click('#controls-selected-days')
        await browser.pause(50)
        await browser.click_when_visible(`#days-${days}`)
        await browser.click('#contentTitle')// remove from focus
      },
      async getDaysBackSelected () {
        return await browser.getHTML('#controls-selected-days')
      },
      async selectedReferralCodes () {
        return await browser.getAttribute('.select2-selection__choice', 'title')
      }
    }
  }

  incrementBy (number) {
    this.variable += number
  }
}

setWorldConstructor(CustomWorld)

