import { photosCarrousel } from './photos-accueil.js'
import { observerMouvement } from '../interface/mouvement.js'
import template from './carrousel.html?raw'
import './carrousel.css'

const intervalle = 6500

function Carrousel($interval, $scope, $window, textes) {
  this.t = textes
  this.photos = photosCarrousel
  this.active = 0
  this.enPause = false
  let minuterie

  const changerPhoto = (index) => {
    if (index === this.active) return
    this.precedente = this.active
    this.active = index
  }

  const arreter = () => {
    if (!minuterie) return
    $interval.cancel(minuterie)
    minuterie = undefined
  }
  const relancer = () => {
    arreter()
    if (!this.animationPermise || this.enPause) return
    minuterie = $interval(() => {
      changerPhoto((this.active + 1) % photosCarrousel.length)
    }, intervalle)
  }

  this.$onInit = () => observerMouvement($scope, $window, (permis) => {
    this.animationPermise = permis
    relancer()
  })
  this.$onDestroy = arreter
  this.selectionner = (index) => {
    changerPhoto(index)
    relancer()
  }
  this.basculer = () => {
    this.enPause = !this.enPause
    relancer()
  }
}

Carrousel.$inject = ['$interval', '$scope', '$window', 'textes']
export const carrousel = { controller: Carrousel, template }
