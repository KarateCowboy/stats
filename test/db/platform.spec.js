require('../test_helper')
/* global describe, context, pg_client, specify, expect */

describe('platform functions', async function () {
  context('os x', async function () {
    specify('sp.canonical_platform - darwin', async function () {
      const results = await pg_client.query('SELECT sp.canonical_platform(\'darwin\', \'amd64\') AS platform', [])
      expect(results.rows[0].platform).to.equal('osx-bc')
    })
    specify('osx', async function () {
      const results = await pg_client.query('SELECT sp.canonical_platform(\'osx\', \'amd64\') AS platform', [])
      expect(results.rows[0].platform).to.equal('osx-bc')
    })
    specify('OSX', async function () {
      const results = await pg_client.query('SELECT sp.canonical_platform(\'OSX\', \'amd64\') AS platform', [])
      expect(results.rows[0].platform).to.equal('osx-bc')
    })
    specify('OS X', async function () {
      const results = await pg_client.query('SELECT sp.canonical_platform(\'OS X\', \'amd64\') AS platform', [])
      expect(results.rows[0].platform).to.equal('osx-bc')
    })
  })

  specify('sp.canonical_platform - linux', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'linux\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('linux-bc')
  })

  context('windows platforms', async function () {
    context('64-bit', async function () {
      specify('Win64', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'Win64\', \'amd64\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winx64-bc')
      })

      specify('win64', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'win64\', \'amd64\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winx64-bc')
      })

      specify('winx64', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'winx64\', \'amd64\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winx64-bc')
      })

      specify('winx64-bc', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'winx64-bc\', \'amd64\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winx64-bc')
      })
    })

    context('32 bit', async function () {
      specify('win32', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'win32\', \'x86\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winia32-bc')
      })

      specify('Win32', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'Win32\', \'x86\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winia32-bc')
      })

      specify('winia32', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'winia32\', \'x86\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winia32-bc')
      })

      specify('winia32-bc', async function () {
        const results = await pg_client.query('SELECT sp.canonical_platform(\'winia32-bc\', \'x86\') AS platform', [])
        expect(results.rows[0].platform).to.equal('winia32-bc')
      })
    })
  })

  specify('sp.canonical_platform - other', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'other\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('other')
  })

  specify('sp.canonical_platform - unknown', async function () {
    const results = await pg_client.query('SELECT sp.canonical_platform(\'unknown\', \'amd64\') AS platform', [])
    expect(results.rows[0].platform).to.equal('unknown')
  })
})
