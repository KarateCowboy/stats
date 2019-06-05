/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

require('./test_helper')

describe('Database Utilities', async function () {
  context('deprecations', async function () {
    describe('crash_trg trigger and function', async function () {
      specify('crash_trg trigger does not exist', async function () {
        const triggerResults = await knex.raw(`SELECT * from pg_trigger WHERE tgname LIKE '%crash_trg%'`)
        expect(triggerResults.rows).to.have.property('length', 0, 'Trigger crash_trg should not exist in the triggers table but was nonetheless found')
      })
      specify('function does not exist', async function () {
        const functionResults = await knex.raw('select * From pg_proc WHERE proname LIKE \'%crash_trg%\'')
        expect(functionResults.rows).to.have.property('length', 0, 'Function crash_trg should not exist in the pg_proc table but was nonetheless found')
      })
    })
  })
})

