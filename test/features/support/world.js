/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const {setWorldConstructor} = require('cucumber')

class CustomWorld {
  constructor () {

    this.adminPassword = 'SOME_TEST_PASSWORD'
    this.sessionSecret = 'SUPER_SECRET_SESSION_SALT_THAT_IS_LONG'
    process.env.SESSION_SECRET = this.sessionSecret
    process.env.ADMIN_PASSWORD = this.adminPassword
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
        await browser.pause(100)
        await browser.click('#contentTitle')// remove from focus
      },
      async setDaysBack (days) {
        await browser.execute(() => { $("#controls-selected-days").click()})
        // await browser.click('#controls-selected-days')
        await browser.pause(500)
        await browser.waitForVisible(`#days-${days}`, 2000)
        await browser.click_when_visible(`#days-${days}`)
        await browser.click_when_visible(`#days-${days}`)
        await browser.pause(500)
        await browser.click('#contentTitle')// remove from focus
      },
      async getDaysBack () {
        await browser.pause(30)
        const text = await browser.getText('#controls-selected-days')
        return text.replace(' days', '')
      },
      async setChannel (channel) {
        await browser.pause(30)
        await browser.click('#controls-channels-dropdown')
        await browser.pause(10)
        await browser.click(`a[data-channel=${channel}]`)
        await browser.click('#contentTitle')// remove from focus
        await browser.pause(10)
      },
      async unsetAllChannels () {
        const selectors = [
          'dev',
          'beta',
          'nightly',
          'release'
        ]
        for (let selector of selectors) {
          let cssClass = await browser.getAttribute(`#${selector} > a > i`, 'class')
          if (cssClass.match('fa-blank') === null) {
            await browser.click('#controls-channels-dropdown')
            await browser.pause(10)
            await browser.click(`a[data-channel=${selector}]`)
            await browser.pause(10)
            await browser.click('#contentTitle')// remove from focus
            await browser.pause(10)
          }
          let newCssClass = await browser.getAttribute(`#${selector} > a > i`, 'class')
        }
      },
      async getDaysBackSelected () {
        return await browser.getHTML('#controls-selected-days')
      },
      async selectedReferralCodes () {
        return await browser.getAttribute('.select2-selection__choice', 'title')
      },
      async getContentTitle () {
        return await browser.getText('#contentTitle')
      }
    }
  }

  get tableHelpers () {
    return {
      async tableRows () {
        await browser.pause(100)
        return await browser.getHTML('#usageDataTable > tbody > tr')
      }
    }
  }

  incrementBy (number) {
    this.variable += number
  }
}

setWorldConstructor(CustomWorld)

