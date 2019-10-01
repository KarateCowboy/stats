/* global Scenario, Feature */
require('../test_helper')
const _ = require('lodash')
Feature('Recent crashes')

Scenario('test something', async (I) => {
  const winCrashes = await factory.buildMany('win64-crash', 25)
  winCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
  const linCrashes = await factory.buildMany('linux-crash', 25)
  linCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
  const osxCrashes = await factory.buildMany('osx-crash', 25)
  osxCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
  const androidCrashes = await factory.buildMany('android-crash', 25)
  androidCrashes.slice(0, 12).forEach((c) => { c.contents.ver = '71.22.11'})
  const allCrashes = _.flatten([winCrashes, linCrashes, osxCrashes, androidCrashes])
  await db.Crash.query().insert(allCrashes)

  /*(
    - half core
    - half not core
    - different platforms
    - different channels
    - maybe seek to return only 10 or so crashes
   */
  await I.amOnPage('/dashboard#recent_crashes')
  await I.selectChannels(['release'])
  await I.selectCoreOptions(['winx64-bc'])
})
