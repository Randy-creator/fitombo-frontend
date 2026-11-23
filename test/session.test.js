import assert from 'node:assert/strict'
import test from 'node:test'
import { creerSession } from '../src/session/session.js'

const initiaux = { accessToken: 'ancien', refreshToken: 'rotation-1' }
const nouveaux = { accessToken: 'nouveau', refreshToken: 'rotation-2' }
const profil = { nom: 'Aina', langue: 'mg' }
const nonAutorise = Object.assign(new Error('Session expirée'), { status: 401 })

test('connecte le compte, sérialise le renouvellement et déconnecte avec les nouveaux jetons', async () => {
  let rotations = 0
  const session = creerSession(async (chemin, options) => {
    if (chemin === '/auth/connexion') {
      assert.deepEqual(options.corps, { email: 'aina@example.test', motDePasse: 'test-seulement' })
      return initiaux
    }
    if (chemin === '/me') {
      assert.equal(options.jeton, initiaux.accessToken)
      return profil
    }
    if (chemin === '/auth/refresh') {
      rotations += 1
      assert.deepEqual(options.corps, { refreshToken: initiaux.refreshToken })
      return nouveaux
    }
    if (chemin === '/auth/deconnexion') {
      assert.equal(options.jeton, nouveaux.accessToken)
      assert.deepEqual(options.corps, { refreshToken: nouveaux.refreshToken })
      return
    }
    if (options.jeton === initiaux.accessToken) throw nonAutorise
    assert.equal(options.jeton, nouveaux.accessToken)
    return chemin
  })
  await session.connecter({ email: 'aina@example.test', motDePasse: 'test-seulement' })
  assert.equal(session.profil, profil)
  assert.deepEqual(await Promise.all([
    session.privee('/exploitations'),
    session.privee('/alertes'),
  ]), ['/exploitations', '/alertes'])
  assert.equal(rotations, 1)
  await session.deconnecter()
  assert.equal(session.profil, undefined)
})

test('ne rejoue pas une mutation après expiration', async () => {
  let ecritures = 0
  const session = creerSession(async (chemin) => {
    if (chemin === '/auth/connexion') return initiaux
    if (chemin === '/me') return profil
    if (chemin === '/auth/refresh') return nouveaux
    ecritures += 1
    throw nonAutorise
  })
  await session.connecter({})
  await assert.rejects(session.privee('/exploitations', { method: 'POST', corps: { nom: 'Ferme' } }), nonAutorise)
  assert.equal(ecritures, 1)
  assert.equal(session.profil, profil)
})

test('une révocation termine la session quand le renouvellement est rejeté', async () => {
  const session = creerSession(async (chemin) => {
    if (chemin === '/auth/connexion') return initiaux
    if (chemin === '/me') return profil
    throw nonAutorise
  })
  await session.connecter({})
  await assert.rejects(session.privee('/exploitations'), nonAutorise)
  assert.equal(session.profil, undefined)
  assert.equal(session.expiree, true)
})

test('un refus d’accès à une exploitation préserve la session', async () => {
  const session = creerSession(async (chemin) => {
    if (chemin === '/auth/connexion') return initiaux
    if (chemin === '/me') return profil
    throw Object.assign(new Error('Exploitation inaccessible'), { status: 404 })
  })
  await session.connecter({})
  await assert.rejects(session.privee('/exploitations/id/tableau-de-bord'), { status: 404 })
  assert.equal(session.profil, profil)
})
