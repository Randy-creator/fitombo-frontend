import assert from 'node:assert/strict'
import test from 'node:test'
import { requete } from '../src/api/http.js'
import { demanderCode, verifierEmail } from '../src/compte/api-compte.js'

test('inscrit un éleveur en deux étapes et accepte la réponse de vérification vide', async (t) => {
  const email = 'aina@example.test'
  const demandeId = 'identifiant-demande'
  const champs = { email, code: '012345', nom: 'Aina', langue: 'mg', motDePasse: 'test-seulement' }
  const etapes = [
    ['/api/auth/inscription', { email }, Response.json({ demandeId, expiresIn: 300 }, { status: 202 })],
    ['/api/auth/verification-email', { demandeId, ...champs }, new Response(null, { status: 201 })],
  ]
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const [attendu, corps, reponse] = etapes.shift()
    assert.equal(url, attendu)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), corps)
    return reponse
  })
  const demande = await demanderCode(email)
  assert.equal(demande.demandeId, demandeId)
  assert.equal(await verifierEmail(demande.demandeId, champs), undefined)
  assert.equal(etapes.length, 0)
})

test('conserve le statut d’une erreur sans corps et ajoute le Bearer', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    assert.equal(options.headers.Authorization, 'Bearer jeton-test')
    return new Response(null, { status: 404 })
  })
  await assert.rejects(requete('/exploitations/id', { jeton: 'jeton-test' }), { status: 404 })
})

test('lit la page JSON des exploitations', async (t) => {
  const page = { items: [{ id: 'ferme-test', nom: 'Ferme Aina' }], page: 0, totalPages: 1 }
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/exploitations?page=0')
    assert.match(options.headers.Accept, /application\/json/)
    return Response.json(page)
  })
  assert.deepEqual(await requete('/exploitations?page=0'), page)
})
