import template from './application.html?raw'
import './application.css'

function Application($q, $scope, $location, session, textes) {
  this.session = session
  this.t = textes
  $scope.$watch(() => session.profil, (profil, ancienProfil) => {
    if (profil?.langue) this.choisirLangue(profil.langue)
    if (!profil && ancienProfil) $location.search('page', null).replace()
  })
  this.choisirLangue = (langue) => {
    textes.langue = langue === 'mg' ? 'mg' : 'fr'
    document.documentElement.lang = textes.langue
  }
  this.deconnecter = () => {
    this.fermeture = true
    this.erreurSession = undefined
    return $q.when(session.deconnecter()).catch((erreur) => {
      this.erreurSession = erreur
    }).finally(() => { this.fermeture = false })
  }
}

Application.$inject = ['$q', '$scope', '$location', 'session', 'textes']
export const application = { controller: Application, template }
