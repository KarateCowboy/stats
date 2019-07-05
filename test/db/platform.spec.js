require('../test_helper')

describe('platform functions', async function () {
  specify('sp.canonical_platform - darwin', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'darwin\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('osx')
  })

  specify('sp.canonical_platform - linux', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'linux\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('linux')
  })

  specify('sp.canonical_platform - winx64', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'win32\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('winx64-bc')
  })

  specify('sp.canonical_platform - winia32', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'win32\', \'x86\') AS platform', [])
    expect(results.rows[0].platform).to.equal('winia32-bc')
  })

  specify('sp.canonical_platform - other', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'other\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('other')
  })

  specify('sp.platform_mapping - unknown', async function () {
    const results = await pg_client.query('SELECT sp.platform_mapping(\'unknown\') AS platform', [])
    expect(results.rows[0].platform).to.equal('linux')
  })

  specify('sp.platform_mapping - osx', async function () {
    const results = await pg_client.query('SELECT sp.platform_mapping(\'osx\') AS platform', [])
    expect(results.rows[0].platform).to.equal('osx')
  })
})
