import imageFond from '../assets/photos/apercu-paturage.webp'
import videoFond from '../assets/videos/boucle-paturages.mp4'
import { observerMouvement } from './mouvement.js'
import template from './fond-video.html?raw'
import './fond-video.css'

function FondVideo($scope, $window) {
  this.image = imageFond
  this.video = videoFond
  observerMouvement($scope, $window, (permis) => { this.anime = permis })
}

FondVideo.$inject = ['$scope', '$window']
export const fondVideo = { controller: FondVideo, template }
