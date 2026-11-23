const baseApi = (import.meta.env?.DEV ? '/api' : import.meta.env?.VITE_API_BASE_URL?.trim() || '/api')
  .replace(/\/+$/, '')

export class ErreurApi extends Error {
  constructor(status, probleme) {
    super(probleme?.detail || `HTTP ${status}`)
    this.status = status
    this.code = probleme?.code
  }
}

export async function requete(chemin, { method = 'GET', corps, jeton } = {}) {
  const headers = { Accept: 'application/json, application/problem+json' }
  if (corps !== undefined) headers['Content-Type'] = 'application/json'
  if (jeton) headers.Authorization = `Bearer ${jeton}`
  const reponse = await fetch(`${baseApi}${chemin}`, {
    method,
    headers,
    body: corps === undefined ? undefined : JSON.stringify(corps),
    signal: AbortSignal.timeout(12000),
  })
  const contenu = await reponse.text()
  const json = reponse.headers.get('content-type')?.includes('json')
  if (!reponse.ok) {
    let probleme
    if (json && contenu) {
      try { probleme = JSON.parse(contenu) } catch { /* Le statut reste exploitable. */ }
    }
    throw new ErreurApi(reponse.status, probleme)
  }
  if (!contenu) return undefined
  return JSON.parse(contenu)
}
