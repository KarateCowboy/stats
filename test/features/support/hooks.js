/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

global.server = require(process.cwd() + '/src/index')
const webdriver = require('webdriverio')
const {After, AfterAll, Before, BeforeAll} = require('cucumber')
require('../../../test/test_helper')

const bindHelpers = function () {
  if (browser.click_when_visible === void 0) {
    browser.addCommand('click_when_visible', async function (selector) {
      await browser.waitForVisible(selector, 3000)
      await browser.click(selector)
    })
  }
  if (browser.get_html_when_visible === void 0) {
    browser.addCommand('get_html_when_visible', async function (selector) {
      await browser.waitForVisible(selector, 3000)
      return await browser.getHTML(selector)
    })
  }
  if (browser.get_text_when_visible === void 0) {
    browser.addCommand('get_text_when_visible', async function (selector) {
      await browser.waitForVisible(selector, 3000)
      return await browser.getText(selector)
    })
  }
  if (browser.select_by_value_when_visible === void 0) {
    browser.addCommand('select_by_value_when_visible', async function (selector, value) {
      await browser.waitForVisible(selector, 3000)
      await browser.selectByValue(selector, value)
    })
  }
}
Before(async function () {
  await test_helper.truncate()
  await server.setup({pg: global.pg_client, mg: global.mongo_client})
  //for chrome
  const options = {desiredCapabilities: {browserName: 'chrome', 'chromeOptions': {args: ['--headless']}}}
  //keep around for testing with firefox
  //const options = {desiredCapabilities: {browserName: 'firefox', 'moz:firefoxOptions': {args: ['-headless']}}}
  global.browser = webdriver.remote(options)
  try {
    await server.kickoff()
  } catch (e) {
    console.log('server failed to run')
    console.log(e.message)
    throw e
  }
  bindHelpers()
  await browser.init()
})
BeforeAll(async function () {
  process.env.TEST = 'true'
  process.env.SESSION_SECRET = this.sessionSecret
  process.env.ADMIN_PASSWORD = this.adminPassword
  await test_helper.setup()
})

After({timeout: 10000}, async function () {
  await server.shutdown()
  await browser.end()
})
AfterAll(async function () {
  await test_helper.tear_down()
  setTimeout(function () {
    process.exit()
  }, 1500)
})
