export function glissementGuide() {
  return {
    require: '^^guideAccueil',
    link(scope, element, _attrs, guide) {
      const livre = element[0]
      let geste

      const commencer = (event) => {
        if (!event.isPrimary || event.button !== 0 || geste || guide.feuillet) return
        geste = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          largeur: livre.clientWidth,
        }
        livre.setPointerCapture?.(event.pointerId)
      }

      const deplacer = (event) => {
        if (event.pointerId !== geste?.id) return
        const horizontal = event.clientX - geste.x
        const vertical = Math.abs(event.clientY - geste.y)
        if (!geste.direction) {
          if (Math.abs(horizontal) < 8 || vertical >= Math.abs(horizontal)) return
          geste.direction = horizontal < 0 ? 1 : -1
        }

        const direction = geste.direction
        const distance = Math.max(0, -horizontal * direction)
        const progression = Math.min(.96, distance / (geste.largeur / 2))
        scope.$evalAsync(() => guide.glisser(direction, progression))
      }

      const terminer = (event) => {
        if (event.pointerId !== geste?.id) return
        const { direction, x, largeur } = geste
        geste = undefined
        if (!direction) return
        const distance = -(event.clientX - x) * direction
        const valider = event.type === 'pointerup' && distance >= Math.min(75, largeur * .23)
        scope.$evalAsync(() => guide.relacher(direction, valider))
      }

      const ecouteurs = {
        pointerdown: commencer,
        pointermove: deplacer,
        pointerup: terminer,
        pointercancel: terminer,
        lostpointercapture: terminer,
      }
      for (const [type, action] of Object.entries(ecouteurs)) livre.addEventListener(type, action)
      scope.$on('$destroy', () => {
        for (const [type, action] of Object.entries(ecouteurs)) livre.removeEventListener(type, action)
      })
    },
  }
}
