export function observerMouvement($scope, $window, actualiser) {
  const media = $window.matchMedia('(prefers-reduced-motion: no-preference)')
  const connexion = $window.navigator.connection
  const verifier = () => actualiser(media.matches && !connexion?.saveData)
  const changement = () => $scope.$evalAsync(verifier)

  verifier()
  media.addEventListener('change', changement)
  connexion?.addEventListener?.('change', changement)
  $scope.$on('$destroy', () => {
    media.removeEventListener('change', changement)
    connexion?.removeEventListener?.('change', changement)
  })
}
