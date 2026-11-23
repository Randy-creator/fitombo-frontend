import assert from 'node:assert/strict'
import test from 'node:test'
import { glissementGuide } from '../src/compte/glissement-guide.js'

function creerLivre() {
  const ecouteurs = new Map()
  const appels = []
  let nettoyer
  const livre = {
    clientWidth: 320,
    setPointerCapture(id) { appels.push(['capture', id]) },
    addEventListener(type, action) { ecouteurs.set(type, action) },
    removeEventListener(type) { ecouteurs.delete(type) },
  }
  const guide = {
    glisser(direction, progression) { appels.push(['glisser', direction, progression]) },
    relacher(direction, valider) { appels.push(['relacher', direction, valider]) },
  }
  glissementGuide().link({
    $evalAsync(action) { action() },
    $on(_type, action) { nettoyer = action },
  }, [livre], {}, guide)
  return {
    envoyer(type, x, y = 20, pointerType = 'mouse') {
      ecouteurs.get(type)?.({
        type, pointerType, pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y,
      })
    },
    appels,
    nettoyer,
    ecouteurs,
  }
}

test('un glissement suit le pointeur et valide une page dans chaque direction', () => {
  const livre = creerLivre()
  livre.envoyer('pointerdown', 200)
  livre.envoyer('pointermove', 120)
  livre.envoyer('pointerup', 120)
  livre.envoyer('pointerdown', 100, 20, 'touch')
  livre.envoyer('pointermove', 180, 20, 'touch')
  livre.envoyer('pointerup', 180, 20, 'touch')
  assert.deepEqual(livre.appels, [
    ['capture', 1], ['glisser', 1, .5], ['relacher', 1, true],
    ['capture', 1], ['glisser', -1, .5], ['relacher', -1, true],
  ])
})

test('un mouvement court est annulé et le défilement vertical reste libre', () => {
  const livre = creerLivre()
  livre.envoyer('pointerdown', 200)
  livre.envoyer('pointermove', 168)
  livre.envoyer('pointerup', 168)
  livre.envoyer('pointerdown', 200)
  livre.envoyer('pointermove', 185, 80)
  livre.envoyer('pointercancel', 185, 80)
  assert.deepEqual(livre.appels, [
    ['capture', 1], ['glisser', 1, .2], ['relacher', 1, false], ['capture', 1],
  ])
  livre.nettoyer()
  assert.equal(livre.ecouteurs.size, 0)
})
