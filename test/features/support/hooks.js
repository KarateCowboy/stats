/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

global.server = require(process.cwd() + '/src/index')
const {After, Before} = require('cucumber')

const bindHelpers = function () {
  if (browser.click_when_visible === void 0) {
    browser.addCommand('click_when_visible', async function (selector) {
      await browser.waitForVisible(selector, 3000)
      await browser.click(selector)
    })
  }
  if (browser.select_by_value_when_visible === void 0) {
    browser.addCommand('select_by_value_when_visible', async function (selector, value) {
      await browser.waitForVisible(selector, 3000)
      await browser.selectByValue(selector, value)
    })
  }
  if (browser.select_by_value_when_visible === void 0) {
    browser.addCommand('set_value_when_visible', async function (selector, value) {
      await browser.waitForVisible(selector, 3000)
      await browser.setValue(selector, value)
    })
  }
}
Before(async function () {
  process.env.SESSION_SECRET = this.sessionSecret
  process.env.ADMIN_PASSWORD = this.adminPassword
  const TestHelper = require('../../../test/test_helper').TestHelper
  this.test_helper = new TestHelper()
  await this.test_helper.setup()
  await this.test_helper.truncate()
  await server.setup({pg: global.pg_client, mg: global.mongo_client})
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

After({timeout: 10000}, async function () {
  await server.shutdown()
  await browser.end()
  await this.test_helper.tear_down()
})
