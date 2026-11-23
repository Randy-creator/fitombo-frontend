import { requete } from '../api/http.js'

export function demanderCode(email) {
  return requete('/auth/inscription', { method: 'POST', corps: { email } })
}

export function verifierEmail(demandeId, { email, motDePasse, nom, langue, code }) {
  return requete('/auth/verification-email', {
    method: 'POST',
    corps: { demandeId, email, motDePasse, nom, langue, code },
  })
}
