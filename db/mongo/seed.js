const Platform = require('../../src/models/platform.model')()
const Channel = require('../../src/models/channel.model')()
module.exports.exec = async () => {

  const platform_names = [
    'linux',
    'osx',
    'winia32',
    'winx64',
    'androidbrowser',
    'android',
    'ios',
    'linux-bc',
    'osx-bc',
    'winia32-bc',
    'winx64-bc'
  ]
  if( (await Platform.count()) === 0){
    await Promise.all( platform_names.map( async name => {
      const platform = new Platform({ name: name })
      await platform.save()
    }))
  }

  const channel_names = [
    'beta',
    'developer',
    'stable',
    'nightly',
    'dev',
    'release'
  ]
  if( (await Channel.count()) === 0){
    await Promise.all( channel_names.map( async name => {
      const channel = new Channel({ name: name })
      await channel.save()
    }))
  }

}
