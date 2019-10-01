const _ = require('lodash')
// in this file you can append custom step methods to 'I' object

module.exports = function () {
  return actor({

    selectChannels: async function (channels) {
      const dbChannels = await knex('dtl.channels').select('*').where('channel', '!=', 'unknown')
      const allChannels = dbChannels.map(c => c.channel)
      const self = this
      const uncheckedChannels = _.difference(allChannels, channels)
      await self.click('#controls-channels-dropdown')
      for (let channel of channels) {
        let classes = await self.grabAttributeFrom(`#${channel} .fa`, 'className')
        if (classes[0].includes('fa-check') === false) {
          await self.click(`#${channel} .fa`)
        }
      }
      for (let channel of uncheckedChannels) {
        let classes = await self.grabAttributeFrom(`#${channel} .fa`, 'className')
        if (classes[0].includes('fa-check')) {
          await self.click(`#${channel} .fa`)
        }
      }
    },
    selectCoreOptions: async function (coreOptions) {
      const self = this
      const allPlatforms = await knex('dtl.platforms').select('*')
      console.dir(allPlatforms, { colors: true })
      process.exit()
      for (let option of coreOptions) {
        let classes = await self.grabAttributeFrom(`#${option} .fa`, 'className')
        console.dir(classes, { colors: true })
        if (classes[0].includes('fa-check') === false) {
          self.click(`#${option} .fa`)
        }
      }
    }

    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

  })
}
