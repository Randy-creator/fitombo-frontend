import { observerMouvement } from '../interface/mouvement.js'
import imageExploitation from '../assets/illustrations/guide/creer-exploitation.webp'
import imageIndicateurs from '../assets/illustrations/guide/indicateurs-exploitation.webp'
import imageInscription from '../assets/illustrations/guide/inscription-email.webp'
import imageConnexion from '../assets/illustrations/guide/connexion-compte.webp'
import imageTableau from '../assets/illustrations/guide/tableau-de-bord.webp'
import imageDeconnexion from '../assets/illustrations/guide/fin-session.webp'
import template from './guide-accueil.html?raw'
import pageTemplate from './page-guide.html?raw'
import './guide-accueil.css'

const pages = [
  {
    titre: 'fonctionExploitations', texte: 'detailExploitations', image: imageExploitation,
    etapes: ['guideOuvrirListe', 'guideNomSysteme'],
  },
  {
    titre: 'fonctionIndicateurs', texte: 'detailIndicateurs', image: imageIndicateurs,
    etapes: ['guideChoisirExploitation', 'guideLirePeriode'],
  },
  { titre: 'inscription', texte: 'guideInscription', image: imageInscription, etapes: ['guideDemanderCode', 'guideValiderCode'] },
  { titre: 'connexion', texte: 'guideConnexion', image: imageConnexion, etapes: ['guideChoisirIdentifiant', 'guideEntrerMotDePasse'] },
  { titre: 'tableau', texte: 'guideTableau', image: imageTableau, etapes: ['guideLireEffectif', 'guideLireMarge'] },
  { titre: 'deconnexion', texte: 'guideDeconnexion', image: imageDeconnexion, etapes: ['guideOuvrirEntete', 'guideQuitterCompte'] },
].map((page, index) => ({ ...page, numero: index + 1 }))
const dureeFeuillet = 620

function GuideAccueil($scope, $window, $timeout) {
  this.debut = 0
  this.total = pages.length
  let minuterie

  this.$onInit = () => observerMouvement($scope, $window, (permis) => {
    this.animationPermise = permis
  })
  this.$onDestroy = () => {
    if (minuterie) $timeout.cancel(minuterie)
  }

  this.pageGauche = () => pages[this.feuillet?.gauche ?? this.debut]
  this.pageDroite = () => pages[this.feuillet?.droite ?? this.debut + 1]

  const preparerFeuillet = (direction) => {
    const cible = this.debut + direction * 2
    if (cible < 0 || cible >= pages.length) return undefined

    const suivant = direction > 0
    return {
      cible,
      suivant,
      gauche: suivant ? this.debut : cible,
      droite: suivant ? cible + 1 : this.debut + 1,
      recto: pages[this.debut + (suivant ? 1 : 0)],
      verso: pages[cible + (suivant ? 0 : 1)],
    }
  }

  const finaliser = (cible, duree) => {
    minuterie = $timeout(() => {
      this.debut = cible
      this.feuillet = undefined
      minuterie = undefined
    }, duree)
  }

  this.tourner = (direction) => {
    if (this.feuillet) return
    const feuillet = preparerFeuillet(direction)
    if (!feuillet) return
    if (!this.animationPermise) {
      this.debut = feuillet.cible
      return
    }

    feuillet.style = { animationDuration: `${dureeFeuillet}ms` }
    this.feuillet = feuillet
    finaliser(feuillet.cible, dureeFeuillet)
  }

  this.glisser = (direction, progression) => {
    if (!this.animationPermise || minuterie) return
    const feuillet = this.feuillet ?? preparerFeuillet(direction)
    if (!feuillet) return
    feuillet.glisse = true
    feuillet.progression = progression
    feuillet.style = { transform: `rotateY(${-direction * 180 * progression}deg)` }
    this.feuillet = feuillet
  }

  this.relacher = (direction, valider) => {
    const feuillet = this.feuillet
    if (!feuillet) {
      if (valider) this.tourner(direction)
      return
    }
    if (!feuillet.glisse || minuterie) return

    const cible = valider ? feuillet.cible : this.debut
    if (!this.animationPermise) {
      this.debut = cible
      this.feuillet = undefined
      return
    }
    const reste = valider ? 1 - feuillet.progression : feuillet.progression
    const duree = Math.round(150 + reste * 255)
    feuillet.style = {
      transform: `rotateY(${valider ? -direction * 180 : 0}deg)`,
      transitionDuration: `${duree}ms`,
    }
    finaliser(cible, duree)
  }
}

GuideAccueil.$inject = ['$scope', '$window', '$timeout']

export const guideAccueil = {
  bindings: { t: '<' },
  controller: GuideAccueil,
  template,
}

export const pageGuide = {
  bindings: { t: '<', page: '<' },
  template: pageTemplate,
}
