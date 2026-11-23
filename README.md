# Frontend Fitombo

Socle web en AngularJS 1.8.3, dernière version stable publiée du paquet
`angular`. Le support officiel d’AngularJS a pris fin en janvier 2022.
[Paquet AngularJS sur npm](https://www.npmjs.com/package/angular)

## Démarrage local

Démarre d’abord Spring et PostgreSQL selon le [guide de l’espace de travail](../README.md).
Depuis ce dossier, vérifie que `curl -fsS http://127.0.0.1:8080/ping`
renvoie `pong`. Si Spring échoue au démarrage, vérifie notamment que la
base nommée dans `fitombo/.env` par `DB_URL` existe. Compose initialise
la base de `DB_NAME` uniquement lors de la création du volume PostgreSQL.
Si `DB_URL` cible `fitombo_api_test`, lance `make -C .. postgres-test`
pour démarrer PostgreSQL et créer cette base si elle manque, puis
`make -C .. backend`.

Avec Node.js 22.12 ou ultérieur (ou Node.js 20 à partir de 20.19) et npm,
exécuter depuis ce dossier :

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:5173. Le bouton de l’accueil appelle `GET /ping`
et vérifie que le backend répond `pong`.

Vite transmet `/api/ping` à `http://127.0.0.1:8080/ping`. Si Spring
écoute ailleurs en développement, copie `.env.example` en `.env.local`
et adapte `FITOMBO_API_PROXY_TARGET`. Redémarre Vite après ce changement.

`npm run check` vérifie la syntaxe JavaScript. `npm run build` génère le site
statique dans `dist/`. Pour les modes de déploiement, voir
[le guide racine](../README.md).

## Analyse documentaire

| Domaine | Conséquences pour le frontend |
| --- | --- |
| Comptes et accès | Inscription par code e-mail à six chiffres, connexion par e-mail ou, pour les comptes historiques éligibles, par téléphone vérifié. Renouveler les deux jetons via une seule requête à la fois. Déterminer les droits par exploitation. Les écritures de gestion, les finances, le tableau de bord et l’export Excel sont réservés au propriétaire. |
| Exploitations et cheptel | Organiser les écrans autour de l’exploitation active. Distinguer les fiches individuelles et les lots selon le référentiel d’espèces. Prévoir filtres, pagination à partir de zéro, emplacements et invitations. |
| Journal | Choisir une seule cible par saisie individuelle et adapter le formulaire au type d’événement. Une correction conserve la trace de la saisie initiale. Actualiser les données liées après les opérations qui modifient le cheptel. |
| Suivi et finances | Afficher les valeurs de croissance, progression et marge retournées par l’API. Manipuler les dates métier comme des dates civiles et afficher les montants en ariary. Télécharger les PDF et classeurs avec le Bearer. |
| Alertes et partage | Afficher les alertes issues du backend et respecter la révocation des accès. Les statistiques d’organisation portent sur les éleveurs consentants et respectent un seuil minimal. |
| Hors ligne | Les routes actuelles synchronisent le journal. Le client devra garder un UUID par opération, envoyer au plus 50 opérations par lot, conserver les rejets à corriger et n’avancer le curseur qu’après application locale. Partitionner les données par compte et exploitation. |
| Usage terrain | Concevoir pour les petits écrans et les réseaux lents, avec une saisie courte et accessible, des contenus français et malagasy et des états explicites pour les erreurs et l’accès perdu. |

Le cahier des charges de 16 pages décrit le produit cible et privilégie un
client Android. Pour ce client web, le contrat OpenAPI décrit les routes
actuelles. Il expose 47 chemins et 85 schémas. Les routes sont à la racine,
la vérification utilise l’e-mail et la synchronisation utilise un curseur
`transaction` / `sequence`. Les routes d’administration, le téléversement
de photos et la modification directe des fiches animal ou lot ne figurent
pas dans ce contrat. Le guide backend demande Java 25, contrairement à
Java 21 indiqué dans le cahier des charges.

Le périmètre MVP du cahier des charges commence par les comptes,
les exploitations, le cheptel, les pesées, les objectifs et les ventes.
Le socle livré contient l’accueil et le contrôle de disponibilité de
l’API. Les parcours métier restent à implémenter.

- [Cahier des charges](../fitombo/docs/Cahier%20des%20charges%20%E2%80%94%20Fitombo.pdf) et [modèle UML](../fitombo/docs/elevage-uml.mermaid)
- [Contrat OpenAPI](../openapi.json), [intégration web](../frontend-integration.md) et [conventions frontend](../frontend-developpement.md)
- [Guide backend](../fitombo/docs/developpement.md) et [scénarios de tests manuels](../fitombo/docs/tests-manuels.md)
