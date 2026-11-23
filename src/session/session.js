export function creerSession(requete) {
  let jetons
  let profil
  let renouvellement
  let fermeture = false
  let expiree = false
  let generation = 0

  function effacer() {
    generation += 1
    jetons = undefined
    profil = undefined
  }

  function renouveler(anciens) {
    if (jetons !== anciens) return Promise.resolve(jetons)
    renouvellement ??= requete('/auth/refresh', {
      method: 'POST',
      corps: { refreshToken: anciens.refreshToken },
    }).then((nouveaux) => {
      if (jetons === anciens) jetons = nouveaux
      return jetons
    }).catch((erreur) => {
      if (jetons === anciens) {
        expiree = true
        effacer()
      }
      throw erreur
    }).finally(() => { renouvellement = undefined })
    return renouvellement
  }

  async function privee(chemin, options = {}) {
    const courants = jetons
    const sessionCourante = generation
    if (!courants || fermeture) throw Object.assign(new Error('Session requise'), { status: 401 })
    try {
      return await requete(chemin, { ...options, jeton: courants.accessToken })
    } catch (erreur) {
      if (erreur.status !== 401 || fermeture || generation !== sessionCourante) throw erreur
      const nouveaux = await renouveler(courants)
      if (!nouveaux || fermeture || generation !== sessionCourante || (options.method && options.method !== 'GET')) throw erreur
      return requete(chemin, { ...options, jeton: nouveaux.accessToken })
    }
  }

  return {
    get profil() { return profil },
    get expiree() { return expiree },
    privee,
    async connecter(identifiants) {
      expiree = false
      jetons = await requete('/auth/connexion', { method: 'POST', corps: identifiants })
      try {
        profil = await privee('/me')
      } catch (erreur) {
        effacer()
        throw erreur
      }
    },
    async deconnecter() {
      fermeture = true
      try {
        await renouvellement
        if (jetons) {
          await requete('/auth/deconnexion', {
            method: 'POST',
            jeton: jetons.accessToken,
            corps: { refreshToken: jetons.refreshToken },
          })
        }
      } finally {
        effacer()
        expiree = false
        fermeture = false
      }
    },
  }
}
