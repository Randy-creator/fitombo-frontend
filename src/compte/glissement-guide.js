export function glissementGuide($window) {
  return {
    require: '^^guideAccueil',
    link(scope, element, _attrs, guide) {
      const livre = element[0]
      let geste
      let imageEnAttente

      const annulerImage = () => {
        if (imageEnAttente === undefined) return
        $window.cancelAnimationFrame(imageEnAttente)
        imageEnAttente = undefined
      }

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

        const distance = Math.max(0, -horizontal * geste.direction)
        geste.progression = Math.min(.96, distance / (geste.largeur / 2))
        if (imageEnAttente !== undefined) return
        const courant = geste
        imageEnAttente = $window.requestAnimationFrame(() => {
          imageEnAttente = undefined
          scope.$evalAsync(() => {
            if (geste === courant) guide.glisser(courant.direction, courant.progression)
          })
        })
      }

      const terminer = (event) => {
        if (event.pointerId !== geste?.id) return
        const { direction, x, largeur } = geste
        geste = undefined
        annulerImage()
        if (!direction) return
        const distance = -(event.clientX - x) * direction
        const valider = event.type === 'pointerup' && distance >= Math.min(75, largeur * .23)
        scope.$evalAsync(() => guide.relacher(direction, valider))
      }

      const terminerAnimation = (event) => {
        if (!event.target.classList.contains('guide-feuillet')) return
        if (event.type === 'transitionend' && event.propertyName !== 'transform') return
        scope.$evalAsync(() => guide.finAnimation())
      }

      const ecouteurs = {
        pointerdown: commencer,
        pointermove: deplacer,
        pointerup: terminer,
        pointercancel: terminer,
        lostpointercapture: terminer,
        animationend: terminerAnimation,
        transitionend: terminerAnimation,
      }
      for (const [type, action] of Object.entries(ecouteurs)) livre.addEventListener(type, action)
      scope.$on('$destroy', () => {
        annulerImage()
        geste = undefined
        for (const [type, action] of Object.entries(ecouteurs)) livre.removeEventListener(type, action)
      })
    },
  }
}

glissementGuide.$inject = ['$window']
