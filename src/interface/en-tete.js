import template from './en-tete.html?raw'
import './en-tete.css'

export const enTete = {
  bindings: {
    profil: '<',
    t: '<',
    fermeture: '<',
    onLangue: '&',
    onDeconnexion: '&',
  },
  template,
}
