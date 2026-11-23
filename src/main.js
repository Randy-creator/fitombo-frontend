import 'angular/angular.js'
import './styles/base.css'
import { requete } from './api/http.js'
import { application } from './application/application.js'
import { compte } from './compte/ecran-compte.js'
import { carrousel } from './compte/carrousel.js'
import { guideAccueil, pageGuide } from './compte/guide-accueil.js'
import { glissementGuide } from './compte/glissement-guide.js'
import { creerApiExploitations } from './exploitations/api-exploitations.js'
import { exploitations } from './exploitations/ecran-exploitations.js'
import { creerTextes } from './i18n/textes.js'
import { enTete } from './interface/en-tete.js'
import { fondVideo } from './interface/fond-video.js'
import { creerSession } from './session/session.js'

window.angular.module('fitombo', [])
  .factory('session', () => creerSession(requete))
  .factory('textes', creerTextes)
  .factory('apiExploitations', creerApiExploitations)
  .component('enTeteFitombo', enTete)
  .component('fondVideo', fondVideo)
  .component('carrouselFitombo', carrousel)
  .component('guideAccueil', guideAccueil)
  .component('pageGuide', pageGuide)
  .directive('glissementGuide', glissementGuide)
  .component('compteFitombo', compte)
  .component('exploitationsFitombo', exploitations)
  .component('fitomboApp', application)

window.angular.bootstrap(document, ['fitombo'], { strictDi: true })
