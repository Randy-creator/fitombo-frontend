export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api')
  .replace(/\/+$/, '')

export function creerClientApi($http) {
  return {
    verifierDisponibilite() {
      return $http.get(`${apiBaseUrl}/ping`, {
        responseType: 'text',
        timeout: 8000,
      }).then(({ data }) => data === 'pong')
    },
  }
}

creerClientApi.$inject = ['$http']
