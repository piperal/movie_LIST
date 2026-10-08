import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getMovies } from './movies.js'

function fakeClient(result) {
  return { from: () => ({ select: async () => result }) }
}

test('getMovies returns rows', async () => {
  const client = fakeClient({ data: [{ id: 1, title: 'Alien' }], error: null })
  const movies = await getMovies(client)
  assert.equal(movies.length, 1)
  assert.equal(movies[0].title, 'Alien')
})

test('getMovies throws on error', async () => {
  const client = fakeClient({ data: null, error: new Error('boom') })
  await assert.rejects(() => getMovies(client), /boom/)
})