const _ = require('lodash')
module.exports.exec = async () => {
  const platforms = [
    ['winx64', 'Muon Windows 64', 'Muon Win64'],
    ['winia32', 'Muon Windows 32', 'Muon Win32'],
    ['osx', 'Muon OSX', 'Muon OSX'],
    ['linux', 'Muon Linux', 'Muon Linux'],
    ['winx64-bc', 'Brave Core Windows 64', 'Core Win64'],
    ['winia32-bc', 'Brave Core  Windows 32', 'Core Win32'],
    ['osx-bc', 'Brave Core OSX', 'Core OSX'],
    ['linux-bc', 'Brave Core Linux', 'Core Linux'],
    ['android', 'Link Bubble', 'Link Bubble'],
    ['androidbrowser', 'Android', 'Android'],
    ['ios', 'iOS', 'iOS'],
    ['unknown', 'Unknown', 'Unknown']
  ]
  const channels = [
    ['unknown', 'Unknown', 'Unknown'],
    ['dev', 'Release channel', 'Release'],
    ['beta', 'Beta channel', 'Beta'],
    ['stable', 'Stable channel', 'Stable'],
    ['developer', 'Developer channel', 'Developer'],
    ['nightly', 'Nightly channel', 'Nightly'],
    ['release', 'Release', 'Release']
  ]
  let platformCount = (await db.Platform.query().count())[0]
  if (parseInt(platformCount.count) === 0) {
    await Promise.all(platforms.map(async platform => {
      await db.Platform.query().insert({
        platform: platform[0],
        description: platform[1],
        label: platform[2]
      })
    }))
  }

  let channelCount = (await db.Channel.query().count())[0]
  if (parseInt(channelCount.count) === 0) {
    await Promise.all(channels.map(async c => {
      await db.Channel.query().insert({channel: c[0], description: c[1], label: c[2]})
    }))
  }

  let publisherPlatforms = await knex('dtl.publisher_platforms').select()
  if (_.isEmpty(publisherPlatforms)) {
    const platforms = [
      {
        platform: 'publisher',
        label: 'Publishers',
        ord: 0,
        icon_url: 'internet.svg'
      },
      {
        platform: 'youtube',
        label: 'Youtube',
        ord: 1,
        icon_url: 'youtube.svg'
      },
      {
        platform: 'twitch',
        label: 'Twitch',
        ord: 2,
        icon_url: 'twitch.svg'
      }
    ]
    for (let i of platforms) {
      await knex('dtl.publisher_platforms').insert(i)
    }
  }

}
