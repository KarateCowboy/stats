const Platform = require('../../src/models/platform.model')()
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
}
