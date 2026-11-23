import { demanderCode, verifierEmail } from './api-compte.js'
import template from './ecran-compte.html?raw'
import './ecran-compte.css'

function Compte($q, session, textes) {
  this.t = textes
  this.indicatif = '+261'
  this.mode = 'connexion'
  this.champs = { langue: 'fr', identifiant: 'email' }
  this.choisir = (mode) => {
    this.mode = mode
    this.erreur = ''
    this.succes = ''
    this.champs = { langue: this.t.langue, identifiant: 'email' }
    this.demande = undefined
  }
  this.identifiantTelephone = () => this.mode === 'connexion' && this.champs.identifiant === 'telephone'
  this.changerIdentifiant = () => {
    this.champs.identifiant = this.champs.identifiant === 'email' ? 'telephone' : 'email'
    this.erreur = ''
  }
  this.soumettre = () => {
    if (this.occupe) return
    this.occupe = true
    this.erreur = ''
    this.succes = ''
    const { identifiant, numeroNational, email, motDePasse } = this.champs
    const action = async () => {
      if (this.mode === 'connexion') {
        const identifiants = identifiant === 'telephone'
          ? { telephone: `${this.indicatif}${numeroNational}`, motDePasse }
          : { email, motDePasse }
        await session.connecter(identifiants)
      } else if (!this.demande) {
        this.demande = await demanderCode(email)
      } else {
        await verifierEmail(this.demande.demandeId, this.champs)
        this.choisir('connexion')
        this.champs.email = email
        this.succes = this.t.lire('compteCree')
      }
    }
    return $q.when(action()).catch((erreur) => {
      this.erreur = this.t.erreur(erreur, this.mode === 'connexion')
    }).finally(() => { this.occupe = false })
  }
}

Compte.$inject = ['$q', 'session', 'textes']
export const compte = { controller: Compte, template }
