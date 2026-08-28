# Alertia / PulseCare

Application académique de démonstration pour la surveillance de patients à distance. Le projet fournit à un médecin une station clinique permettant de consulter les constantes vitales, les alertes, les tendances, l'état des appareils, l'environnement de la chambre et le dossier médical de quatre patients synthétiques.

> **Important** : cette application est une démonstration technique. Elle n'est pas un dispositif médical et ne remplace pas le jugement clinique. Aucune donnée patient réelle ne doit être utilisée.

## Fonctionnalités

- Authentification médecin avec Supabase.
- Tableau de bord global des quatre patients suivis.
- Vue détaillée par patient.
- Affichage des constantes vitales : fréquence cardiaque, SpO2, température, fréquence respiratoire et pression artérielle.
- Historique et graphiques de mesures.
- Niveau de risque, priorité, tendances et fraîcheur des données.
- Alertes cliniques et alertes techniques.
- Comparaison avec les valeurs de référence du patient.
- Symptômes, résumé de monitoring et points d'attention.
- État des capteurs, qualité des données et environnement de la chambre.
- Consultation du dossier médical.
- Interface 3D/WebGL servant de couche immersive visuelle, tandis que les informations cliniques restent affichées dans le DOM.
- Simulation légère des dernières valeurs pour la démonstration live côté patient.

Le périmètre est limité à `PATIENT-001`, `PATIENT-002`, `PATIENT-003` et `PATIENT-004`. Il n'y a pas de gestion avancée des rôles, de multi-tenant ou d'architecture distribuée.

## Parcours utilisateur

1. L'utilisateur accède à la page d'accueil puis à la connexion médecin.
2. Après authentification, il ouvre le tableau de bord clinique.
3. Le dashboard regroupe les patients, les indicateurs clés, la fraîcheur des données et les alertes actives.
4. La sélection d'un patient ouvre son monitoring détaillé.
5. La vue patient interroge l'API, affiche les données CSV normalisées et actualise l'affichage périodiquement.
6. La déconnexion Supabase redirige vers `/login`.

## Routes

| Route | Description |
| --- | --- |
| `/` | Page d'accueil et présentation de PulseCare. |
| `/login` | Connexion médecin. |
| `/dashboard` | Vue clinique globale et synthèse des patients. |
| `/patients` | Liste des patients suivis. |
| `/patient/[id]` | Monitoring détaillé d'un patient autorisé. |
| `/alerts` | Centre des alertes. |
| `/records` | Consultation des dossiers médicaux. |
| `/environment` | Données environnementales des chambres. |
| `/ward` | Vue du service et de ses éléments de monitoring. |
| `/api/monitoring/dashboard` | Données agrégées du dashboard. |
| `/api/monitoring/patient/[id]` | Données détaillées d'un patient. |

Les routes API nécessitent une session Supabase valide et renvoient `401` si l'utilisateur n'est pas authentifié. Un identifiant patient inconnu renvoie `404`. Une indisponibilité de la source de monitoring renvoie `502`.

## Architecture du projet

```text
app/
	(app)/                 Pages protégées et layout clinique
	api/monitoring/        Routes API du monitoring
	login/                 Page et formulaire de connexion
components/
	canvas/                Scènes 3D, canvas et effets visuels
	monitoring/            Dashboard, graphiques et panneaux médicaux
	ui/                    Shell clinique et composants d'interface
lib/
	monitoring/            CSV, types, normalisation et simulation
	supabase/              Clients serveur, navigateur et middleware
	store.ts               Etat partagé de télémétrie
styles/                  Design tokens CSS
shaders/                 Shaders GLSL organisés par effet
public/                  Modèles 3D, textures, HDRI et polices
scripts/                 Vérifications automatisées
```

### Flux des données

1. Les routes serveur récupèrent les fichiers CSV à partir des URL configurées dans les variables d'environnement.
2. `lib/monitoring/csv.ts` charge les données.
3. `lib/monitoring/normalization.ts` convertit et sécurise les valeurs issues des CSV.
4. `lib/monitoring/patient-data.ts` filtre les quatre patients, déduplique les mesures, trie les historiques et calcule la fraîcheur.
5. Les routes API renvoient les réponses typées du dashboard ou du patient.
6. Les composants React affichent les données sous forme de cartes, graphiques, tableaux et panneaux cliniques.
7. La vue patient actualise les données toutes les cinq secondes et applique une simulation légère à des fins de démonstration. Le niveau de risque n'est pas modifié par cette simulation.

## Modèle de données

Les principaux types sont définis dans `lib/monitoring/types.ts`.

- `PatientMeasurement` : constantes, symptômes, qualité réseau, qualité des données, risque et tendances.
- `PatientAlert` : catégorie, priorité, gravité, statut et résumé de l'alerte.
- `PatientMedicalRecord` : identité synthétique, antécédents, traitements, références et contexte de suivi.
- `RoomEnvironmentMeasurement` : température ambiante, humidité, pression et informations du capteur.
- `PatientMonitoringResponse` : réponse complète de la vue patient.
- `DashboardMonitoringResponse` : patients résumés, alertes, KPI et date de mise à jour.

La fraîcheur est `FRESH` pendant moins de cinq minutes, `STALE` jusqu'à dix minutes, puis `OFFLINE`. Dans le dashboard, ces états sont présentés comme `LIVE`, `DELAYED` et `OFFLINE`.

## Source CSV et variables d'environnement

La source de données prévue est Google Sheets publié ou exposé sous forme de CSV. Le projet attend les variables suivantes pour le monitoring :

```env
PATIENT_MEASUREMENTS_CSV_URL=https://...
ALERTS_CSV_URL=https://...
DOSSIER_MEDICALE_CSV_URL=https://...
ROOM_CONDITIONS_CSV_URL=https://...
```

Les variables Supabase nécessaires sont celles utilisées par `lib/supabase/env.ts`. Elles doivent rester dans `.env.local` et ne doivent jamais être commit ou exposées dans le navigateur lorsqu'elles sont secrètes.

Les feuilles ou exports attendus sont `patient_measurements`, `alerts`, `roomCondition` et `dossierMedicale`.

## Installation

Prérequis : Node.js compatible avec Next.js 15 et npm.

```bash
npm install
```

Créer ensuite `.env.local` avec les variables Supabase et les URL CSV nécessaires, puis lancer le serveur :

```bash
npm run dev
```

L'application est disponible par défaut à `http://localhost:3000`.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Lance Next.js en développement. |
| `npm run dev:turbo` | Lance Next.js avec Turbopack. |
| `npm run build` | Compile l'application pour la production. |
| `npm run start` | Démarre le build de production. |
| `npm run lint` | Exécute ESLint. |
| `npm run typecheck` | Vérifie les types TypeScript. |
| `npm run check:tokens` | Vérifie la cohérence des design tokens. |
| `npm run check` | Exécute les vérifications tokens, TypeScript et lint. |

## Design et rendu

La direction artistique est une interface médicale sombre de type « Holographic Vitals ». Elle combine une couche DOM lisible pour les informations actionnables et une couche WebGL immersive pour le contexte visuel : jumeau numérique, particules, lumière, profondeur et effets de post-processing.

La règle principale est la **Loi de la Couche Vitale** : toute valeur clinique, unité, alerte, identité patient, date de mesure et action médicale doit rester nette, accessible et indépendante des effets WebGL. Les tokens sont centralisés dans `styles/tokens.css`, avec leur miroir TypeScript dans `lib/tokens.ts`.

## Sécurité et limites

- Les données de démonstration doivent être synthétiques.
- L'authentification protège les API de monitoring, mais le projet reste une démonstration.
- La source CSV doit être contrôlée et disponible avant d'afficher des données fiables.
- Les données disposent d'un état de fraîcheur afin d'éviter de présenter une mesure ancienne comme une mesure live.
- Aucune fonctionnalité ne doit être décrite comme un diagnostic, une prédiction ou une décision médicale automatisée.
- Les mentions réglementaires, l'hébergement de données de santé et les exigences de production restent à définir avant tout usage réel.

## État du projet

Le socle Next.js, l'authentification, les routes de monitoring, les types, la normalisation CSV, les vues cliniques et les composants 3D sont présents dans le dépôt. Le README initial décrivait une ancienne phase du projet et ne reflétait plus l'organisation actuelle.

Les éléments à consolider avant une utilisation autre qu'académique sont notamment :

- la configuration et la gouvernance de la source Google Sheets ;
- les tests fonctionnels et visuels sur les écrans de monitoring ;
- la gestion complète des erreurs et des données manquantes ;
- la sécurisation et la conformité réglementaire ;
- la clarification du nom de produit entre Alertia, PulseCare et Vitalis.

## Licence et données

Ce dépôt est destiné à un usage académique et de démonstration. Ne pas y ajouter de données médicales réelles, de secrets, de clés privées ou d'informations permettant d'identifier une personne.
