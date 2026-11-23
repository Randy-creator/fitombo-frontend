import 'angular/angular.js'
import { creerClientApi } from './api/client.js'

const angular = window.angular

function AccueilFitombo(api) {
  this.verifierApi = () => {
    this.verificationEnCours = true
    this.message = 'Vérification en cours…'

    return api.verifierDisponibilite().then(
      (disponible) => {
        this.message = disponible ? 'API disponible.' : 'Réponse inattendue de l’API.'
      },
      ({ status, xhrStatus }) => {
        if (xhrStatus === 'timeout') {
          this.message = 'L’API ne répond pas dans le délai prévu.'
        } else if (status === 502) {
          this.message = 'Le serveur web ne parvient pas à joindre l’API (HTTP 502).'
        } else if (status > 0) {
          this.message = `Le test de connexion a échoué (HTTP ${status}).`
        } else {
          this.message = 'Le navigateur n’a reçu aucune réponse de l’API.'
        }
      },
    ).finally(() => {
      this.verificationEnCours = false
    })
  }
}

AccueilFitombo.$inject = ['api']

angular.module('fitombo', [])
  .factory('api', creerClientApi)
  .component('fitomboApp', {
    controller: AccueilFitombo,
    template: `
      <h1>Fitombo</h1>
      <p>Carnet d’élevage</p>
      <button type="button" ng-click="$ctrl.verifierApi()" ng-disabled="$ctrl.verificationEnCours">
        Tester la connexion à l’API
      </button>
      <p role="status" ng-bind="$ctrl.message"></p>
    `,
  })

angular.bootstrap(document, ['fitombo'], { strictDi: true })
