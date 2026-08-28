## PULSECARE — PROJECT OVERRIDES

Cette implémentation est un projet de démonstration académique avec exactement 4 patients synthétiques.

### Périmètre fonctionnel

- 4 patients uniquement :
  - PATIENT-001
  - PATIENT-002
  - PATIENT-003
  - PATIENT-004

- Source de données principale :
  - Google Sheets

- Feuilles disponibles :
  - patient_measurements
  - alerts
  - roomCondition
  - dossierMedicale

- Authentification :
  - login médecin simple
  - un seul type d'utilisateur
  - pas de RBAC
  - pas de multi-tenant
  - pas de gestion complexe des permissions

- Backend :
  - minimal
  - lecture des données Google Sheets
  - authentification simple
  - aucune architecture distribuée

- Routes principales :
  - /login
  - /dashboard
  - /patient/[id]

### Priorité de cette section

Les règles de DESIGN.md restent la source de vérité pour :

- direction artistique
- architecture WebGL / DOM
- React Three Fiber
- Drei
- GSAP
- shaders
- animations
- transitions
- design tokens
- performance
- accessibilité
- jumeau numérique
- visualisation médicale

Cependant, si un exemple ou une spécification fonctionnelle du reste du document parle de :

- 180 lits
- plusieurs établissements
- cohortes massives
- architecture hospitalière complexe
- utilisateurs multiples
- permissions avancées

alors cette section PULSECARE prend priorité.

L'objectif réel est de construire une expérience 3D premium autour de 4 patients synthétiques, avec un dashboard médecin riche, un jumeau numérique, les constantes vitales, les alertes, les conditions de chambre et le dossier médical.

Ne pas ajouter de fonctionnalité hors de ce périmètre sans instruction explicite.

# VITALIS — Design System & Spécification d'Implémentation

> **Projet** : plateforme de monitoring médical et de suivi patient.
> **Nom de code** : `VITALIS` (remplaçable — chercher/remplacer si la marque change).
> **Nature du document** : source de vérité unique pour la direction artistique, l'architecture de rendu et l'implémentation front-end.
> **Destinataire** : agent IA de développement.
> **Stack verrouillée** : Next.js (App Router) + React Three Fiber + Drei + GSAP ScrollTrigger + Lenis + Tailwind.
> **Version du document** : 1.0 — 2026-08-26.

---

## 0. Règles d'engagement pour l'agent

Lis cette section en entier avant d'écrire une seule ligne de code.

1. **Ce document est la source de vérité.** Si une décision d'implémentation n'y figure pas, la déduire des tokens de la §3 et des principes de la §2 — jamais improviser une couleur, une durée, un easing ou une police.
2. **Aucune valeur magique.** Toute couleur, durée, easing, distance de caméra, intensité lumineuse provient d'un token nommé. Si tu as besoin d'une valeur qui n'existe pas, tu l'ajoutes au fichier de tokens avec un nom explicite, puis tu l'utilises.
3. **La Loi de la Couche Vitale (§1.3) est non négociable.** Elle prime sur toute considération esthétique. Aucune exception, aucune dérogation « juste pour cette page ».
4. **Anti-minimalisme assumé.** Ce produit doit être dense, volumétrique, en mouvement permanent. Ne « simplifie » pas une scène pour la rendre propre. La clarté s'obtient par la hiérarchie de la lumière, pas par la soustraction. Voir §2.3.
5. **Construis dans l'ordre de la roadmap (§17).** Ne saute pas de phase. Chaque phase a une définition de « terminé » vérifiable.
6. **Performance en continu, pas à la fin.** Le budget de la §14 est un contrat. Une phase qui fait sortir du budget n'est pas terminée.
7. **Code et commentaires en anglais. Interface et contenu en français** (i18n FR/EN prévu, FR par défaut).
8. **Ne mens pas sur ce qui fonctionne.** Si un effet n'a pas été testé visuellement, dis-le. Si une dépendance ne s'installe pas, remonte-le au lieu de contourner en silence.
9. **Tu as le droit de contester ce document.** Si une spec est techniquement infaisable ou dangereuse, arrête-toi, explique pourquoi, propose une alternative. Ne l'implémente pas à moitié.

---

## 1. Le produit et sa contradiction fondatrice

### 1.1 Deux publics, deux besoins opposés

| Public                                            | Contexte d'usage                                                                         | Ce qu'il exige                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Soignants (infirmiers, médecins, réanimation)** | Écran regardé 8 à 12 heures d'affilée, plusieurs patients simultanés, décisions urgentes | Densité d'information, lecture instantanée, zéro ambiguïté, zéro fatigue oculaire |
| **Investisseurs, jurys, salons professionnels**   | Regard de 90 secondes, comparaison avec des concurrents fades                            | Effet de sidération immédiat, mémorabilité, sensation de technologie avancée      |

Ces deux besoins tirent dans des directions opposées. Un produit médical spectaculaire mais illisible est un échec clinique ; un produit lisible mais fade perd le financement qui permet de le construire. **Tout ce document est la résolution méthodique de cette contradiction.**

### 1.2 La résolution : séparation stricte des couches

L'immersion et la vérité ne partagent pas le même plan de rendu.

```
┌──────────────────────────────────────────────────────┐
│  COUCHE VITALE — DOM / HTML                          │  ← la vérité
│  chiffres, unités, seuils, noms, alertes, actions    │
│  net, contrasté, tabulaire, jamais déformé           │
├──────────────────────────────────────────────────────┤
│  COUCHE CHROME — DOM / HTML                          │  ← l'ossature
│  panneaux de verre chanfreinés, navigation, labels   │
├──────────────────────────────────────────────────────┤
│  COUCHE POST-PROCESSING — WebGL                      │  ← l'atmosphère
│  bloom, aberration, grain, vignette, color grading   │
├──────────────────────────────────────────────────────┤
│  COUCHE MONDE — WebGL                                │  ← le sens
│  jumeau numérique, particules, réseau vasculaire,    │
│  grille de lits, constellation de données            │
└──────────────────────────────────────────────────────┘
```

Le canvas WebGL vit **derrière** le DOM. Les effets de post-processing ne peuvent donc, par construction architecturale, jamais dégrader un chiffre vital. C'est la raison profonde de cette architecture, et c'est aussi ce qui produit le meilleur résultat visuel : une typographie parfaitement nette posée sur une scène volumétrique profonde est exactement le rendu recherché.

### 1.3 La Loi de la Couche Vitale

> **Toute information sur laquelle un soignant pourrait agir se rend en DOM, au-dessus du canvas, nette, sans filtre, sans déformation, avec chiffres tabulaires et unité explicite.**

Sont concernés sans exception : valeurs de constantes (FC, SpO₂, PA, FR, T°, EtCO₂), seuils et bornes, nom et identifiant patient, horodatage de la mesure, libellé et priorité d'alerte, boutons d'action clinique, statut de connexion des capteurs.

Corollaires contraignants :

- **Interdit** : `<Text>` / `<Text3D>` / `troika` pour afficher une valeur vitale.
- **Interdit** : placer un chiffre vital dans le champ d'un `DepthOfField`, `Bloom`, `Glitch`, `ChromaticAberration` ou `Noise`.
- **Interdit** : un chiffre vital dont le fond est une scène 3D en mouvement sans écran de contraste (voir `--scrim`, §3.3).
- **Obligatoire** : tout objet 3D interactif possède un jumeau DOM accessible au clavier et au lecteur d'écran (§15.4).
- **Autorisé et encouragé** : la 3D porte le _contexte_ — position spatiale, relation, tendance, gravité, présence corporelle, émotion. Elle ne porte jamais la _valeur_.

Le texte 3D reste autorisé pour les éléments purement décoratifs : titres cinématiques de la landing, micro-labels d'ambiance HUD sans signification clinique, numéros de chambre en arrière-plan de scène.

### 1.4 Cadre réglementaire — à traiter comme une contrainte de design

Ces points ne sont pas juridiques, ils ont un impact direct sur l'interface et la rédaction. À respecter dès la maquette :

- Aucune allégation diagnostique ou pronostique dans l'interface ou le contenu marketing. On écrit « aide à la surveillance », jamais « détecte », « diagnostique » ni « prédit ».
- Mention permanente en pied de page de l'application : _« Outil d'aide à la surveillance. Ne remplace pas le jugement clinique. »_
- Tout affichage de constante porte son horodatage et son état de fraîcheur (§11.5). Une donnée périmée qui a l'air fraîche est le pire défaut possible de ce produit.
- Les captures de démonstration utilisent exclusivement des données synthétiques (§16). Aucune donnée patient réelle, jamais, même anonymisée, dans les assets du dépôt.
- Marquer d'un `TODO(regulatory)` tout emplacement destiné aux mentions CE/MDR et à l'hébergement de santé.

---

## 2. Direction artistique — « Holographic Vitals »

### 2.1 Décision et justification

Direction retenue : **dark holographique med-sci-fi, avec matière bio-organique.**

Pourquoi celle-ci plutôt qu'une autre :

- **Le fond sombre est un choix clinique avant d'être esthétique.** Une salle de réanimation ou un poste de surveillance nocturne est faiblement éclairé ; un fond clair y devient une source lumineuse agressive sur une garde de nuit. Le sombre réduit la fatigue et, surtout, il donne aux couleurs émissives (le vert du stable, le rouge du critique) un contraste que jamais un fond clair n'atteindra. **La sémantique d'alerte gagne en puissance ce que le fond perd en luminosité.**
- **L'holographie porte naturellement la donnée.** Translucidité, superposition, Fresnel, lignes de balayage : ce vocabulaire visuel dit « lecture d'un corps par des capteurs » sans avoir besoin de le légender.
- **Le bio-organique évite le piège du sci-fi générique.** Bruit fluide, formes vasculaires, pulsation, croissance cellulaire : c'est ce qui rattache l'esthétique au vivant, et c'est ce qui distinguera ce produit d'un dashboard cyberpunk interchangeable.
- **Ça tient les deux publics.** Spectaculaire en pitch, contrasté et hiérarchisé au quotidien.

### 2.2 Les trois piliers

**Pilier 1 — Obsidian Depth.** Le vide n'est jamais noir pur ni plat. Toujours un dégradé radial bleu-nuit, une brume volumétrique, une poussière de particules lentes, un horizon suggéré. Profondeur perceptible en permanence : au moins trois plans de netteté distincts à l'écran.

**Pilier 2 — Vital Light.** Toute lumière vive de l'interface provient de la donnée. Rien ne brille par décoration. Un halo qui s'intensifie signifie une valeur qui monte ; une teinte qui glisse vers l'ambre signifie une dérive. Le spectateur doit inconsciemment apprendre que la lumière = l'information.

**Pilier 3 — Living Matter.** Rien n'est jamais immobile ni parfaitement géométrique. Respiration lente sur tous les volumes (amplitude 0.5 à 2 %, période 4 à 7 s), bruit de déplacement sur les surfaces, flux le long des tubes, dérive des particules. Un écran figé est un bug.

### 2.3 Mandat anti-minimaliste

Explicitement demandé par le commanditaire. Traduction opérationnelle, à appliquer :

- **À l'écran en permanence** : minimum 4 couches visuelles superposées (fond volumétrique, particules, objet principal, HUD chanfreiné).
- **Aucun aplat.** Toute surface reçoit soit un dégradé, soit une texture de bruit, soit une trame de balayage, soit une réflexion d'environnement.
- **Densité assumée** dans le dashboard : viser 9 à 14 blocs d'information par vue plutôt que 4. Le soignant veut tout voir sans cliquer.
- **Chrome HUD généreux** : coins chanfreinés, angles marqués, micro-graduations, réticules, indices de coordonnées, compteurs secondaires.
- **Effets sans timidité** : bloom prononcé, aberration chromatique perceptible, grain, god rays.
- **Mais jamais au prix de la hiérarchie.** La règle qui empêche le chaos : à tout instant, **un seul élément détient l'accent lumineux maximal** (`--vital-*` à pleine intensité + bloom au-dessus du seuil). Tout le reste est au minimum 40 % plus sombre. C'est le contraste de luminance, et non le vide, qui structure l'écran. Chargé n'est pas bruité.

### 2.4 Registre de références

À viser comme sensation, sans copier : le rendu produit haut de gamme (matériaux physiquement crédibles, éclairage d'atelier, révélation au scroll) ; les HUD de science-fiction cinématographique des années 2010 (translucidité, chanfreins, lignes fines, texte en périphérie) ; l'imagerie médicale scientifique réelle (angiographie, IRM en coupe, tomographie) — c'est cette dernière qui donne la crédibilité et l'empêche de basculer dans le jeu vidéo ; l'architecture fluide contemporaine pour les formes organiques.

À fuir : le néon violet/rose « synthwave », les dégradés SaaS bleu-violet, la 3D bleue en plastique brillant, les glyphes pseudo-japonais décoratifs, tout ce qui évoque la crypto.

---

## 3. Design tokens

Fichier unique de vérité : `styles/tokens.css` (variables CSS) + `lib/tokens.ts` (miroir TypeScript pour la 3D). **Les deux doivent rester synchronisés** — un test unitaire vérifie l'égalité des valeurs (§18).

### 3.1 Couleurs — socle Obsidian

| Token     | Hex       | Usage                                                   |
| --------- | --------- | ------------------------------------------------------- |
| `--void`  | `#04070C` | Fond absolu, `scene.background`, base du dégradé radial |
| `--abyss` | `#070C14` | Fond de page, fond de canvas                            |
| `--deep`  | `#0B1220` | Fond de panneau de verre (avec alpha)                   |
| `--slate` | `#111C2E` | Surface élevée, ligne de tableau alternée               |
| `--steel` | `#1B2A42` | Surface interactive au repos                            |
| `--fog`   | `#2C4260` | Bordures, graduations, séparateurs                      |

### 3.2 Couleurs — Vital Light

| Token             | Hex       | Sémantique **verrouillée**                                           |
| ----------------- | --------- | -------------------------------------------------------------------- |
| `--vital-mint`    | `#5BFFB0` | **Stable / dans les bornes.** Uniquement cela.                       |
| `--vital-cyan`    | `#35E9DC` | Neutre, informationnel, chrome UI, accent holographique              |
| `--vital-blue`    | `#4C8DFF` | Donnée secondaire, axes, tendance historique                         |
| `--vital-violet`  | `#8B6CFF` | Métrique non alertante (neuro, sommeil, activité)                    |
| `--vital-amber`   | `#FFB23D` | **Avertissement / dérive hors bornes.** Uniquement cela.             |
| `--vital-crimson` | `#FF3B5C` | **Critique / alarme.** Uniquement cela.                              |
| `--plasma`        | `#FF6B9D` | Accent bio-organique (flux sanguin, tissu) — décoratif, non alertant |

**Règle absolue de sémantique chromatique.** `--vital-amber` et `--vital-crimson` sont **interdits comme couleurs décoratives**, partout, sans exception : pas de bouton rouge, pas de titre ambre, pas de particule rouge d'ambiance, pas de dégradé qui les traverse. Leur apparition à l'écran signifie toujours quelque chose de clinique. Cette discipline est ce qui rend une alarme instantanément lisible au milieu d'une scène chargée. `--vital-mint` est réservé au statut « stable » et ne sert pas de couleur de marque.

### 3.3 Couleurs — texte

| Token     | Hex                  | Usage                                                            |
| --------- | -------------------- | ---------------------------------------------------------------- |
| `--bone`  | `#E8EEF7`            | Texte principal, valeurs vitales                                 |
| `--mist`  | `#8FA3BF`            | Texte secondaire, labels                                         |
| `--ash`   | `#5A6E8C`            | Texte tertiaire, unités, métadonnées                             |
| `--scrim` | `rgba(7,12,20,0.72)` | Écran de contraste obligatoire sous tout texte posé sur de la 3D |

### 3.4 Typographie

| Rôle                           | Police               | Graisses      | Réglages                                               |
| ------------------------------ | -------------------- | ------------- | ------------------------------------------------------ |
| Display / titres cinématiques  | **Space Grotesk**    | 500, 700      | `letter-spacing: -0.02em`                              |
| Interface / prose              | **Inter** (variable) | 400, 500, 600 | `font-feature-settings: "tnum" 1, "cv05" 1`            |
| **Données et valeurs vitales** | **JetBrains Mono**   | 500, 700      | `font-variant-numeric: tabular-nums` — **obligatoire** |
| Micro-labels HUD               | **Chakra Petch**     | 500           | `uppercase`, `letter-spacing: 0.14em`, taille ≤ 11px   |

Les chiffres tabulaires sur les valeurs vitales ne sont pas un détail typographique : sans eux, un chiffre qui se rafraîchit fait sautiller la mise en page, ce qui est intolérable sur un écran surveillé en continu.

Échelle (fluide, `clamp`) :

```css
--fs-hero: clamp(2.75rem, 7vw, 7rem); /* Space Grotesk 700 */
--fs-h1: clamp(2rem, 4vw, 3.5rem);
--fs-h2: clamp(1.5rem, 2.5vw, 2.25rem);
--fs-h3: 1.25rem;
--fs-body: 1rem;
--fs-sm: 0.875rem;
--fs-xs: 0.75rem;
--fs-hud: 0.6875rem; /* Chakra Petch */

--fs-vital-xl: clamp(3rem, 5vw, 4.5rem); /* valeur principale patient */
--fs-vital-lg: 2.25rem; /* valeur en carte */
--fs-vital-md: 1.5rem; /* valeur en liste dense */
--lh-vital: 1; /* pas d'interligne parasite */
```

### 3.5 Espacement, grille, formes

```css
--sp-1: 4px;
--sp-2: 8px;
--sp-3: 12px;
--sp-4: 16px;
--sp-5: 24px;
--sp-6: 32px;
--sp-7: 48px;
--sp-8: 64px;
--sp-9: 96px;

--r-xs: 2px;
--r-sm: 4px;
--r-md: 8px;
--r-lg: 16px;
--r-xl: 24px;

/* Chanfrein HUD — signature formelle du produit, préférée au border-radius */
--chamfer-sm: polygon(
  8px 0,
  100% 0,
  100% calc(100% - 8px),
  calc(100% - 8px) 100%,
  0 100%,
  0 8px
);
--chamfer-lg: polygon(
  20px 0,
  100% 0,
  100% calc(100% - 20px),
  calc(100% - 20px) 100%,
  0 100%,
  0 20px
);
```

Grille dashboard : 12 colonnes, gouttière `--sp-4`, marge `--sp-6`. Rail de navigation gauche fixe à 72px replié / 248px déplié.

### 3.6 Élévation — par la lumière, pas par l'ombre

Sur fond sombre, une ombre portée est invisible. L'élévation se code par la lueur et la bordure.

```css
--glow-cyan: 0 0 24px rgba(53, 233, 220, 0.3);
--glow-mint: 0 0 24px rgba(91, 255, 176, 0.3);
--glow-amber: 0 0 28px rgba(255, 178, 61, 0.38);
--glow-crimson: 0 0 32px rgba(255, 59, 92, 0.45);

--edge: inset 0 1px 0 rgba(255, 255, 255, 0.06);
--edge-lit: inset 0 1px 0 rgba(53, 233, 220, 0.22);

/* Panneau de verre — recette canonique, à ne pas réinventer par composant */
--glass-bg: rgba(11, 18, 32, 0.62);
--glass-blur: blur(18px) saturate(1.25);
--glass-border: 1px solid rgba(44, 66, 96, 0.85);
```

### 3.7 Mouvement — easings et durées

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); /* révélations */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1); /* UI courante */
--ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1); /* transitions de scène */
--ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1); /* accent, léger rebond */

--d-micro: 120ms; /* hover, focus, pression */
--d-ui: 320ms; /* ouverture de panneau, bascule */
--d-reveal: 800ms; /* entrée de section */
--d-cine: 1600ms; /* mouvement de caméra, transition de scène */
```

Équivalents GSAP : `power3.out` par défaut, `expo.out` pour les révélations, `power2.inOut` pour les transitions, **`none` pour tout ce qui est scrubbé par le scroll** (un easing sur un scrub donne une sensation de latence — erreur classique).

### 3.8 Amortissement en boucle de rendu

Pour tout suivi progressif dans `useFrame`, utiliser un amortissement **indépendant de la fréquence d'image**. Ne jamais écrire `current += (target - current) * 0.1` : le résultat diffère entre 60 et 144 Hz.

```ts
// lib/damp.ts
export const dampf = (
  current: number,
  target: number,
  lambda: number,
  dt: number,
) => THREE.MathUtils.damp(current, target, lambda, dt);

export const LAMBDA = {
  camera: 3.2, // suivi de caméra
  mouse: 5.0, // parallaxe souris
  hover: 9.0, // réaction de survol
  vital: 1.4, // interpolation de valeur de constante (volontairement lent)
} as const;
```

`LAMBDA.vital` est délibérément lent : une valeur vitale ne doit jamais paraître nerveuse. Elle glisse.

---

## 4. Stack technique

### 4.1 Dépendances

**Politique de version — à appliquer avant d'installer.** Les numéros ci-dessous sont un socle cohérent connu, pas un verrou. `three` est une `peerDependency` de React Three Fiber, et Drei doit suivre la majeure de R3F. Procédure obligatoire : installer, lire les avertissements de peer dependencies, résoudre le triplet `react` / `@react-three/fiber` / `three` avant d'écrire du code, puis **épingler les versions exactes obtenues dans le `package.json`** et noter le triplet retenu en tête de `README.md`. Ne jamais mélanger deux versions de `three` dans l'arbre de dépendances — c'est la première cause de bugs inexplicables sur ce type de projet (`npm ls three` doit renvoyer une seule entrée).

| Paquet                                           | Rôle                                                 | Socle   |
| ------------------------------------------------ | ---------------------------------------------------- | ------- |
| `next`                                           | App Router, RSC, routage                             | ^15     |
| `react`, `react-dom`                             | —                                                    | ^19     |
| `three`                                          | moteur de rendu                                      | ~0.17x  |
| `@react-three/fiber`                             | réconciliateur React ↔ three                         | ^9      |
| `@react-three/drei`                              | helpers (View, Environment, Lightformer, Instances…) | ^10     |
| `@react-three/postprocessing` + `postprocessing` | pile d'effets                                        | ^3 / ^6 |
| `gsap`                                           | timelines, ScrollTrigger, Observer, SplitText        | ^3.13   |
| `lenis`                                          | scroll amorti                                        | ^1      |
| `zustand`                                        | état partagé DOM ↔ 3D                                | ^5      |
| `three-custom-shader-material`                   | injection GLSL dans les matériaux standard           | ^6      |
| `maath`                                          | easing, bruit, échantillonnage, buffers              | ^0.10   |
| `tailwindcss`                                    | couche DOM                                           | ^4      |
| `leva`                                           | panneau de réglage (dev uniquement)                  | ^0.9    |
| `r3f-perf`                                       | mesure (dev uniquement)                              | ^2      |
| `@gltf-transform/cli`                            | optimisation des GLB (Draco, KTX2)                   | dev     |
| `gltfjsx`                                        | génération de composants depuis GLB                  | dev     |

Optionnel, à n'ajouter que si le besoin est démontré : `@react-three/rapier` (physique), `troika-three-text` (texte 3D décoratif uniquement), `tunnel-rat` (si `<View>` de Drei ne suffit pas).

**Explicitement écarté** : toute bibliothèque de composants UI générique (le chrome est trop spécifique pour qu'un kit apporte quoi que ce soit) ; `react-spring` (GSAP couvre tout, deux systèmes d'animation qui coexistent produisent des conflits) ; les loaders GLSL par bundler — voir §4.3.

### 4.2 Contraintes Next.js à connaître d'avance

- Tout composant qui touche `three`, R3F ou GSAP est `"use client"`.
- Le `<Canvas>` ne doit jamais être rendu côté serveur : le charger via `dynamic(() => import(...), { ssr: false })`.
- La landing doit rester indexable : **les textes de la landing vivent en DOM, dans le HTML servi**, pas dans la scène 3D. Bénéfice SEO et compatibilité directe avec la Loi de la Couche Vitale.
- `next/font` pour les quatre polices, avec `display: 'swap'` et préchargement des seules graisses utilisées.

### 4.3 Gestion du GLSL — décision tranchée

**Ne pas configurer de loader `.glsl` dans Webpack/Turbopack.** Les shaders s'écrivent dans des fichiers `.ts` exportant des chaînes de gabarit :

```ts
// shaders/lib/fresnel.ts
export const fresnel = /* glsl */ `
  float fresnel(vec3 viewDir, vec3 nrm, float power) {
    return pow(1.0 - clamp(dot(viewDir, nrm), 0.0, 1.0), power);
  }
`;
```

Motifs : zéro configuration de bundler, composition des chunks par simple concaténation JS, typage et autocomplétion conservés, et le commentaire `/* glsl */` déclenche la coloration syntaxique dans les éditeurs courants. C'est la solution la plus robuste en Next.js.

---

## 5. Architecture des fichiers

```
app/
  layout.tsx                    # monte <CanvasRoot> UNE fois, ne le démonte jamais
  page.tsx                      # landing : sections DOM + <View> ancrées
  (app)/
    layout.tsx                  # rail de navigation + Couche Vitale
    dashboard/page.tsx          # vue multi-patients
    patient/[id]/page.tsx       # jumeau numérique + constantes
    ward/page.tsx               # grille de lits instanciée
  globals.css
  fonts.ts

components/
  canvas/
    CanvasRoot.tsx              # <Canvas> unique, <View.Port>, pile d'effets
    Rig.tsx                     # caméra : scroll + parallaxe souris
    Lights.tsx                  # HDRI + Lightformers + accents
    Effects.tsx                 # post-processing, piloté par le tier qualité
    Atmosphere.tsx              # brume volumétrique, poussière, dégradé de fond
  twin/
    DigitalTwin.tsx             # orchestrateur
    TwinPointCloud.tsx          # nuage de points surfacique
    TwinShell.tsx               # coque Fresnel translucide
    TwinOrgans.tsx              # inserts émissifs (cœur, poumons, vaisseaux)
    bindings.ts                 # métrique clinique -> canal visuel
  viz/
    SignalRibbon.tsx            # ECG / PPG / capnographie via DataTexture
    CohortCloud.tsx             # un point par patient, triage par couleur
    WardGrid.tsx                # InstancedMesh de lits
    TrendSurface.tsx            # champ de hauteur 24 h
  ui/                           # ===== COUCHE VITALE — DOM pur, zéro three =====
    VitalNumber.tsx             # valeur + unité + fraîcheur + état
    VitalPanel.tsx              # panneau de verre chanfreiné
    AlertBanner.tsx             # alarme, priorité, action
    PatientHeader.tsx
    MagneticButton.tsx
    Cursor.tsx
    A11yProxy.tsx               # jumeau DOM des objets 3D interactifs
  scroll/
    ScrollProvider.tsx          # pont Lenis <-> ScrollTrigger
    useSceneProgress.ts

shaders/
  lib/{noise,fresnel,scanline,easing}.ts
  holo/{vertex,fragment}.ts
  ribbon/{vertex,fragment}.ts
  particles/{vertex,fragment}.ts
  transition/{vertex,fragment}.ts

lib/
  store.ts                      # zustand : souris, scroll, patient actif, qualité
  quality.ts                    # détection et bascule de tier
  damp.ts
  tokens.ts                     # miroir TS de tokens.css
  vitals/
    synth.ts                    # générateur de signaux physiologiques réalistes
    thresholds.ts               # bornes cliniques par métrique
    types.ts

public/
  models/   hdri/   textures/   fonts/
```

Règle structurelle stricte : **rien de `components/ui/` n'importe `three`, et rien de `components/canvas|twin|viz/` n'importe de composant DOM.** Les deux mondes communiquent uniquement par le store zustand et par les `ref` de positionnement des `<View>`. Un test de lint doit faire échouer toute violation (§18).

---

## 6. Architecture de rendu — le canvas unique persistant

### 6.1 Principe

**Un seul `<Canvas>` pour toute l'application, monté dans `app/layout.tsx`, jamais démonté.** Motifs : la création d'un contexte WebGL coûte 200 à 600 ms et provoque un blanc à chaque navigation ; les navigateurs limitent le nombre de contextes simultanés (typiquement 8 à 16) et perdent le plus ancien au-delà ; le préchargement des HDRI, GLB et textures est mutualisé et survit aux changements de route.

### 6.2 Plusieurs vues dans un canvas — `<View>` de Drei

C'est la technique centrale du dashboard et l'agent doit la maîtriser avant d'écrire le premier widget. Chaque bloc du dashboard réserve un rectangle DOM ; `<View>` y projette une portion de scène avec sa propre caméra, tout en partageant un unique contexte WebGL et un seul appel de rendu par image.

```tsx
// components/canvas/CanvasRoot.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { View, Preload } from "@react-three/drei";
import * as THREE from "three";

export function CanvasRoot() {
  return (
    <Canvas
      // le canvas est fixe derrière tout le DOM
      className="fixed inset-0 -z-10"
      // les évènements pointeur sont écoutés sur le document entier,
      // indispensable pour que les <View> ancrées dans le DOM reçoivent le survol
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      dpr={[1, 2]}
      gl={{
        antialias: false, // on utilise SMAA dans la pile d'effets
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        scene.background = new THREE.Color("#04070C");
      }}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  );
}
```

Côté page, chaque widget ancre sa vue :

```tsx
const ref = useRef<HTMLDivElement>(null);
<div ref={ref} className="h-[420px] w-full" />
<View track={ref}>
  <PerspectiveCamera makeDefault fov={40} position={[0, 0.4, 3.2]} />
  <Lights preset="clinical" />
  <DigitalTwin patientId={id} />
</View>
```

Points de vigilance, à respecter : `antialias: false` est délibéré et impose SMAA dans la pile d'effets ; `eventSource={document.body}` est obligatoire sinon aucune `<View>` ne reçoit d'évènement pointeur ; la pile de post-processing s'applique globalement — si un widget doit y échapper, l'exclure par `layers` plutôt que d'instancier un second canvas.

### 6.3 Boucle de rendu

- Landing : `frameloop="always"` — la scène est animée en continu.
- Dashboard : `frameloop="always"` également, car les signaux vitaux défilent en permanence. **Ne pas passer en `"demand"`** : un tracé ECG figé sur un écran de monitoring est un défaut grave, pas une optimisation. L'économie se fait par le tier qualité (§14), pas par le gel de l'image.
- Onglet en arrière-plan : suspendre la boucle sur `visibilitychange`, mais continuer à ingérer les données afin qu'aucune alarme ne soit perdue, et rejouer l'état au retour.

### 6.4 Ordre de composition à l'écran

| Couche                               | `z-index` | `pointer-events`                                  |
| ------------------------------------ | --------- | ------------------------------------------------- |
| Canvas WebGL                         | `-10`     | `none` (les évènements passent par `eventSource`) |
| Ancres de `<View>`                   | `0`       | `none`                                            |
| Chrome DOM (panneaux, rail)          | `10`      | `auto`                                            |
| **Couche Vitale** (valeurs, alertes) | `20`      | `auto`                                            |
| Bandeau d'alarme critique            | `50`      | `auto`                                            |
| Curseur personnalisé                 | `90`      | `none`                                            |
| Voile de transition de route         | `100`     | `none`                                            |

---

## 7. Éclairage et atmosphère

### 7.1 Doctrine

Aucune `ambientLight`, aucune `directionalLight` par défaut. Tout l'éclairage vient d'un environnement HDRI et de `Lightformer` positionnés — c'est ce qui produit des réflexions crédibles sur le verre et l'holographie, et c'est la différence visuelle entre « 3D web amateur » et « rendu produit ».

```tsx
// components/canvas/Lights.tsx
import { Environment, Lightformer } from "@react-three/drei";

export function Lights() {
  return (
    <Environment resolution={512} frames={1} background={false}>
      {/* dôme froid très sombre : c'est le socle Obsidian */}
      <Lightformer
        form="rect"
        intensity={0.35}
        color="#0B1220"
        scale={[30, 30, 1]}
        position={[0, 0, -12]}
      />
      {/* liseré cyan principal — sculpte le bord droit du sujet */}
      <Lightformer
        form="rect"
        intensity={5.5}
        color="#35E9DC"
        scale={[2, 8, 1]}
        position={[5, 1, 2]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      {/* contre-jour violet — sépare le sujet du fond */}
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#8B6CFF"
        scale={[2, 8, 1]}
        position={[-5, 0.5, -2]}
        rotation={[0, Math.PI / 3, 0]}
      />
      {/* touche haute froide */}
      <Lightformer
        form="circle"
        intensity={2.4}
        color="#E8EEF7"
        scale={[4, 4, 1]}
        position={[0, 6, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </Environment>
  );
}
```

`frames={1}` : l'environnement est calculé une seule fois puis figé. Ne passer à `frames={Infinity}` que si un objet en mouvement doit se refléter dynamiquement — le coût est élevé.

**Ombres** : pas de `shadowMap` sur la scène. Une seule `<ContactShadows>` sous le sujet principal (`opacity={0.55} blur={2.4} resolution={512}`), plus de l'occlusion ambiante cuite dans les textures. Les shadow maps temps réel n'apportent presque rien sur une scène majoritairement translucide et émissive, pour un coût important.

### 7.2 Volumétrie et poussière — `Atmosphere.tsx`

Trois éléments, toujours présents, jamais désactivés (Pilier 1) :

1. **Dégradé radial de fond** : plan en `ShaderMaterial` sur `renderOrder = -1`, `depthWrite: false`, dégradé `--void` → `--deep` centré, avec `fbm` très basse fréquence animé à 0.02 pour éviter tout aplat.
2. **Poussière** : `Points` de 3 000 particules (tier ultra) / 1 200 (eco) dans un volume de 40³, dérive lente sur bruit de curl, taille atténuée par la distance, `AdditiveBlending`, opacité 0.12 à 0.3.
3. **Brume de profondeur** : `scene.fog = new THREE.FogExp2("#070C14", 0.045)`. C'est le mécanisme qui garantit les trois plans de netteté exigés au Pilier 1, à un coût quasi nul.

**God rays** : uniquement scène 5 de la landing (§10) et uniquement en tier ultra. Implémentation par cônes de `MeshBasicMaterial` additifs orientés caméra, plutôt que par passe de post-processing — bien moins coûteux et plus contrôlable.

---

## 8. Bibliothèque de shaders

Tous les shaders sont composés depuis `shaders/lib/`. **Un chunk n'est écrit qu'une fois et se réutilise partout.** Trois implémentations différentes du bruit dans le projet = échec de revue.

### 8.1 Chunk — bruit gradient 3D et fbm

```ts
// shaders/lib/noise.ts
export const noise = /* glsl */ `
  vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7,  74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dot(hash33(i + vec3(0,0,0)), f - vec3(0,0,0)),
              dot(hash33(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
          mix(dot(hash33(i + vec3(0,1,0)), f - vec3(0,1,0)),
              dot(hash33(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(mix(dot(hash33(i + vec3(0,0,1)), f - vec3(0,0,1)),
              dot(hash33(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
          mix(dot(hash33(i + vec3(0,1,1)), f - vec3(0,1,1)),
              dot(hash33(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }

  float fbm(vec3 p) {
    float amp = 0.5, sum = 0.0;
    for (int i = 0; i < 4; i++) { sum += amp * noise3(p); p *= 2.02; amp *= 0.5; }
    return sum;
  }
`;
```

### 8.2 Chunk — Fresnel et trame de balayage

```ts
// shaders/lib/fresnel.ts
export const fresnel = /* glsl */ `
  float fresnelTerm(vec3 viewDir, vec3 nrm, float power) {
    return pow(1.0 - clamp(dot(normalize(viewDir), normalize(nrm)), 0.0, 1.0), power);
  }
`;

// shaders/lib/scanline.ts
export const scanline = /* glsl */ `
  // bandes horizontales défilantes — signature holographique
  float scanlines(float y, float time, float density, float speed) {
    return 0.5 + 0.5 * sin((y * density) - time * speed);
  }
`;
```

### 8.3 Matériau `HoloMaterial` — le matériau signature

C'est le matériau du jumeau numérique et de tous les volumes holographiques. Implémenté avec `three-custom-shader-material` par-dessus `MeshPhysicalMaterial` afin de conserver PBR, environnement et transmission tout en injectant du GLSL.

**Uniformes du contrat** (à respecter exactement, d'autres composants les piloteront) :

| Uniforme       | Type    | Rôle                                    | Plage  |
| -------------- | ------- | --------------------------------------- | ------ |
| `uTime`        | `float` | horloge                                 | —      |
| `uPulse`       | `float` | phase cardiaque, 0→1 par battement      | 0–1    |
| `uSeverity`    | `float` | 0 stable, 0.5 avertissement, 1 critique | 0–1    |
| `uHover`       | `float` | intensité de survol amortie             | 0–1    |
| `uDissolve`    | `float` | 0 assemblé, 1 dissous en particules     | 0–1    |
| `uDisplace`    | `float` | amplitude du déplacement de sommets     | 0–0.15 |
| `uColorStable` | `vec3`  | `--vital-mint`                          | —      |
| `uColorAlert`  | `vec3`  | `--vital-crimson`                       | —      |
| `uRimColor`    | `vec3`  | `--vital-cyan`                          | —      |

Vertex — respiration, pulsation cardiaque, déplacement par bruit, dissolution :

```ts
// shaders/holo/vertex.ts
import { noise } from "../lib/noise";
export const holoVertex = /* glsl */ `
  ${noise}
  uniform float uTime, uPulse, uDisplace, uDissolve;
  varying vec3 vViewDir;
  varying vec3 vWorldNormal;
  varying float vNoise;
  varying float vY;

  void main() {
    vec3 p = position;

    // respiration lente — Pilier 3 : rien n'est immobile
    float breath = sin(uTime * 0.9) * 0.006;

    // pulsation cardiaque : impulsion brève, pas une sinusoïde
    float beat = pow(1.0 - uPulse, 5.0) * 0.028;

    // relief organique
    vNoise = fbm(p * 2.4 + vec3(0.0, uTime * 0.12, 0.0));
    p += normal * (vNoise * uDisplace + breath + beat);

    // dissolution : les sommets s'éloignent le long de leur normale, bruités
    p += normal * uDissolve * (0.35 + vNoise * 1.6);

    vec4 world = modelMatrix * vec4(p, 1.0);
    vViewDir = cameraPosition - world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vY = p.y;

    csm_Position = p;   // three-custom-shader-material
  }
`;
```

Fragment — liseré Fresnel, trame, gradation de sévérité, dissolution :

```ts
// shaders/holo/fragment.ts
import { fresnel } from "../lib/fresnel";
import { scanline } from "../lib/scanline";
export const holoFragment = /* glsl */ `
  ${fresnel}
  ${scanline}
  uniform float uTime, uSeverity, uHover, uDissolve, uPulse;
  uniform vec3 uColorStable, uColorAlert, uRimColor;
  varying vec3 vViewDir;
  varying vec3 vWorldNormal;
  varying float vNoise;
  varying float vY;

  void main() {
    // sévérité : mint -> crimson, jamais de teinte intermédiaire arbitraire
    vec3 base = mix(uColorStable, uColorAlert, smoothstep(0.0, 1.0, uSeverity));

    float rim = fresnelTerm(vViewDir, vWorldNormal, 2.6);
    float scan = scanlines(vY, uTime, 42.0, 1.6) * 0.18;

    // la pulsation intensifie le liseré : la lumière EST la donnée (Pilier 2)
    float beatGlow = pow(1.0 - uPulse, 3.0) * 0.55;

    vec3 col = base * (0.22 + scan)
             + uRimColor * rim * (1.0 + uHover * 0.9)
             + base * beatGlow;

    // découpe de dissolution par seuil de bruit
    float cut = step(uDissolve * 1.35, vNoise * 0.5 + 0.5);
    if (cut < 0.5) discard;

    // bord incandescent sur le front de dissolution
    float edge = smoothstep(0.0, 0.08, abs(vNoise * 0.5 + 0.5 - uDissolve * 1.35));
    col += uRimColor * (1.0 - edge) * 2.2 * step(0.001, uDissolve);

    csm_DiffuseColor = vec4(col, 1.0);
    csm_Emissive = col * (0.65 + rim * 0.8);
  }
`;
```

### 8.4 Verre liquide

Ne pas écrire de shader de verre. Utiliser `MeshTransmissionMaterial` de Drei, **limité à deux instances simultanées maximum dans la scène** (chaque instance déclenche des passes de rendu supplémentaires). Réglages canoniques :

```tsx
<MeshTransmissionMaterial
  samples={8}
  resolution={512} // ultra ; eco : samples={4} resolution={256}
  thickness={0.85}
  roughness={0.08}
  chromaticAberration={0.35}
  anisotropy={0.25}
  distortion={0.4}
  distortionScale={0.3}
  temporalDistortion={0.12}
  ior={1.42}
  attenuationDistance={1.6}
  attenuationColor="#0B1220"
  color="#35E9DC"
  background={new THREE.Color("#04070C")}
/>
```

Au-delà de deux instances, remplacer par un `MeshPhysicalMaterial` avec `transparent`, `roughness={0.1}`, `envMapIntensity={1.8}` — visuellement 85 % du résultat pour 10 % du coût.

### 8.5 Particules GPU

Un seul système, paramétrable, réutilisé partout (assemblage du corps, poussière, constellation finale). `Points` + `BufferGeometry` avec attributs `aSeed`, `aScale`, `aTarget`. **Toute la simulation dans le vertex shader — jamais de boucle JavaScript sur les positions.**

Contrat : `uProgress` (0 dispersé → 1 formé), `uTime`, `uSize`, `uColorA`, `uColorB`, `uMouse` (`vec3`, répulsion), `uSeverity`.

```ts
// shaders/particles/vertex.ts (extrait — cœur de la logique)
export const particlesVertex = /* glsl */ `
  ${noise}
  uniform float uTime, uProgress, uSize, uPixelRatio;
  uniform vec3 uMouse;
  attribute vec3 aTarget;
  attribute float aSeed, aScale;
  varying float vAlpha;

  void main() {
    // position dispersée, dérive de curl
    vec3 scattered = position + vec3(
      fbm(position * 0.35 + uTime * 0.05),
      fbm(position * 0.35 + 11.0 + uTime * 0.04),
      fbm(position * 0.35 + 23.0 + uTime * 0.06)
    ) * 1.4;

    // décalage par graine : les particules n'arrivent pas toutes ensemble
    float t = clamp((uProgress - aSeed * 0.35) / 0.65, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);                 // smoothstep
    vec3 p = mix(scattered, aTarget, t);

    // répulsion au curseur
    vec3 toMouse = p - uMouse;
    float d = length(toMouse);
    p += normalize(toMouse + 1e-5) * smoothstep(1.2, 0.0, d) * 0.35;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
    vAlpha = mix(0.25, 1.0, t);
  }
`;
```

Fragment : disque doux (`smoothstep` sur `length(gl_PointCoord - 0.5)`), `AdditiveBlending`, `depthWrite: false`, `transparent: true`. Ne pas trier les particules — inutile en additif.

Budgets : 120 000 particules en ultra, 45 000 en standard, 15 000 en eco.

### 8.6 Ruban de signal — la technique clé de la data-viz

Un tracé ECG ne se redessine pas en JavaScript image par image. **Le signal est écrit dans une `DataTexture` en tampon circulaire, et le vertex shader déplace un ruban en lisant cette texture.** Coût CPU : un `texSubImage` par échantillon. Coût GPU : négligeable. C'est ce qui permet d'afficher 20 tracés simultanés à 60 fps.

```ts
// création du tampon (côté JS)
const N = 1024;
const data = new Float32Array(N); // valeurs normalisées 0..1
const tex = new THREE.DataTexture(data, N, 1, THREE.RedFormat, THREE.FloatType);
tex.minFilter = tex.magFilter = THREE.LinearFilter; // NearestFilter si artefacts
tex.wrapS = THREE.RepeatWrapping;
tex.needsUpdate = true;
// à chaque échantillon : data[head] = v; head = (head + 1) % N; tex.needsUpdate = true;
// uniform uHead = head / N
```

```ts
// shaders/ribbon/vertex.ts
export const ribbonVertex = /* glsl */ `
  uniform sampler2D uSignal;
  uniform float uHead;      // tête d'écriture normalisée
  uniform float uAmp;       // amplitude verticale en unités monde
  uniform float uThickness;
  varying float vEdge;      // 0..1 en travers du ruban
  varying float vAge;       // 0 = le plus ancien, 1 = le plus récent

  void main() {
    // uv.x parcourt le temps, uv.y traverse l'épaisseur
    float t = fract(uv.x + uHead);
    float v = texture2D(uSignal, vec2(t, 0.5)).r * 2.0 - 1.0;

    vec3 p = position;
    p.y += v * uAmp;
    p.z += (uv.y - 0.5) * uThickness;

    vEdge = uv.y;
    vAge  = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
```

Fragment : cœur du trait à pleine intensité, bords en dégradé vers zéro (`1.0 - abs(vEdge - 0.5) * 2.0` élevé à une puissance), atténuation de la queue par `vAge` pour l'effet de rémanence d'oscilloscope, teinte pilotée par `uSeverity`, et surintensité sur les 4 % les plus récents pour matérialiser la tête de lecture.

Notes de compatibilité à vérifier à l'implémentation : la lecture de texture dans un vertex shader requiert `MAX_VERTEX_TEXTURE_IMAGE_UNITS >= 1` (satisfait partout en WebGL2) ; le filtrage linéaire d'une texture flottante dépend de `OES_texture_float_linear` — si des artefacts apparaissent, basculer en `HalfFloatType` ou en `NearestFilter`. Utiliser `texture2D` (GLSL 1) sauf si `glslVersion: THREE.GLSL3` est explicitement défini, auquel cas `texture`.

### 8.7 Transition par déplacement

Pour les changements de route et de scène. Quad plein écran devant la caméra (ou passe de post-processing) avec `uProgress` 0→1, une carte de bruit, et une découpe directionnelle :

```glsl
float n = fbm(vec3(vUv * 3.5, uTime * 0.1));
float mask = smoothstep(uProgress - 0.15, uProgress + 0.15, vUv.x + n * 0.35);
vec2 uvA = vUv + vec2(1.0 - mask, 0.0) * 0.12 * n;   // l'ancienne image se tord en partant
```

Durée `--d-cine` (1600 ms) pour un changement de contexte majeur, 900 ms pour une navigation de route, avec `power2.inOut`. Un flash de bloom de 120 ms et une pointe d'aberration chromatique au passage à `uProgress = 0.5` masquent la coupure.

### 8.8 Pile de post-processing

Ordre **impératif** (l'ordre des effets change radicalement le rendu) :

```tsx
<EffectComposer multisampling={0} enableNormalPass={false}>
  {tier === "ultra" && (
    <DepthOfField focusDistance={0.02} focalLength={0.045} bokehScale={3.5} />
  )}
  <Bloom
    intensity={0.85}
    luminanceThreshold={0.35}
    luminanceSmoothing={0.5}
    mipmapBlur
    radius={0.72}
  />
  <ChromaticAberration
    offset={[0.0006, 0.0009]}
    radialModulation
    modulationOffset={0.35}
  />
  {alertActive && (
    <Glitch
      delay={[0, 0]}
      duration={[0.15, 0.3]}
      strength={[0.08, 0.22]}
      mode={GlitchMode.SPORADIC}
    />
  )}
  <Vignette offset={0.28} darkness={0.75} />
  <Noise opacity={0.035} premultiply blendFunction={BlendFunction.OVERLAY} />
  <SMAA />
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
</EffectComposer>
```

Contraintes : `SMAA` est obligatoire puisque `antialias: false` sur le canvas ; `DepthOfField` est le poste le plus coûteux de la pile, réservé au tier ultra et à la landing (jamais sur un dashboard, où il floute des zones utiles) ; `Glitch` ne s'active que sur évènement d'alarme, pendant 400 ms maximum, **jamais en boucle** (§15.3) ; `ToneMapping` en dernier ; `Noise` à 0.035 — au-delà de 0.06 sur fond sombre, le grain se lit comme un bruit vidéo de mauvaise qualité.

---

## 9. Le Jumeau Numérique — pièce maîtresse

C'est l'objet signature du produit : la représentation holographique d'un corps sur laquelle les constantes du patient se projettent en temps réel. C'est ce que retiendront les investisseurs, et c'est aussi une aide réelle à la lecture pour le soignant, parce qu'il localise l'information sur l'anatomie.

### 9.1 Composition en quatre couches

| Couche              | Contenu                               | Technique                                                | Tris/points                             |
| ------------------- | ------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| 1. Nuage surfacique | silhouette en points lumineux         | `MeshSurfaceSampler` sur le GLB → `Points` + shader §8.5 | 150 k (ultra) / 60 k (std) / 20 k (eco) |
| 2. Coque            | volume translucide Fresnel            | GLB décimé + `HoloMaterial` §8.3                         | 45 k tris                               |
| 3. Organes          | cœur, poumons, réseau vasculaire      | meshes séparés, émissifs, animés par les constantes      | 30 k tris                               |
| 4. Chrome HUD       | réticules, anneaux d'axe, graduations | `LineSegments` + sprites additifs                        | négligeable                             |

Le nuage de points est ce qui donne l'aspect « scanné » ; la coque donne le volume ; les organes portent la donnée ; le HUD donne la crédibilité instrumentale. Les quatre sont nécessaires — n'en retirer aucune (mandat anti-minimaliste §2.3).

### 9.2 Chaîne de préparation des assets

1. Modèle anatomique sous licence claire (buste ou corps entier). **Documenter la licence dans `public/models/LICENSE.md`** — un asset non tracé dans un produit médical commercialisé est un problème.
2. Sous Blender : nettoyer, séparer les organes en objets distincts nommés `heart`, `lungs_l`, `lungs_r`, `vessels`, `shell`. Décimer à la cible du tableau. Recentrer l'origine au sternum, échelle en mètres (hauteur ≈ 1.7).
3. Export glTF binaire, puis `gltf-transform optimize in.glb out.glb --compress draco --texture-compress ktx2`.
4. `npx gltfjsx out.glb --transform --types` pour générer le composant typé.
5. Vérifier : **GLB ≤ 3 Mo**, une seule hiérarchie, pas de caméra ni de lumière exportée, noms de meshes conformes.
6. Précharger avec `useGLTF.preload()` et un `DracoLoader` pointant vers des décodeurs auto-hébergés dans `public/draco/` (ne pas dépendre d'un CDN tiers pour un produit de santé).

### 9.3 Liaison donnée → canal visuel

Table de vérité, à implémenter dans `components/twin/bindings.ts`. **Chaque canal visuel a un seul propriétaire clinique** ; deux métriques ne pilotent jamais le même canal.

| Métrique                 | Canal visuel                                        | Correspondance                                                                          |
| ------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Fréquence cardiaque      | pulsation du cœur + intensité du liseré global      | période = 60/FC s ; `uPulse` en dent de scie, `pow(1-uPulse, 5)` pour un pic sec        |
| SpO₂                     | teinte du réseau vasculaire                         | 100 % → `--vital-cyan` ; 94 % → `--vital-mint` ; < 90 % → `--vital-crimson`             |
| Fréquence respiratoire   | échelle des poumons                                 | ±4 % sur une période de 60/FR s, courbe asymétrique (inspiration 40 %, expiration 60 %) |
| Pression artérielle      | vitesse du flux le long des vaisseaux               | offset d'UV du shader de flux, 0.2 à 1.6                                                |
| Température              | `uDisplace` de la coque                             | 36.5 °C → 0.02 ; 39 °C → 0.08 (la surface devient houleuse)                             |
| Sévérité globale (score) | `uSeverity` de toutes les couches + anneau d'alerte | 0 / 0.5 / 1 par palier, transition sur `--d-ui`                                         |
| Fraîcheur du signal      | densité et opacité du nuage de points               | signal périmé > 30 s → le nuage se raréfie et se désature (§11.5)                       |

La dernière ligne est capitale. **Quand la donnée est perdue, le jumeau doit visiblement se déliter.** Un hologramme magnifique et parfaitement stable alimenté par un capteur déconnecté est le scénario le plus dangereux que ce produit puisse produire. La dégradation visuelle est ici une fonctionnalité de sécurité, pas un effet.

### 9.4 Morphose vers l'abstraction

Sur la landing (scènes 6 et 7) et lors du passage patient → cohorte, le corps se transforme en constellation de données : les positions cibles des particules interpolent de `aTarget = surface anatomique` vers `aTarget2 = sphère de Fibonacci`. Un seul uniforme `uMorph` sur la même géométrie, sans changement de nombre de points, donc sans réallocation. Prévoir les deux attributs cibles dès la création de la géométrie.

---

## 10. Chorégraphie du scroll — landing

### 10.1 Mécanique

Une **timeline GSAP maîtresse unique**, scrubbée par le scroll, qui écrit dans un objet de progression simple lu par `useFrame`. Ne jamais animer un état React depuis GSAP, ne jamais appeler `setState` dans `useFrame`.

```tsx
// components/scroll/ScrollProvider.tsx — pont Lenis <-> ScrollTrigger
const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

```ts
// état de scène partagé — objet mutable, PAS du state React
export const scene = {
  progress: 0,
  camX: 0,
  camY: 0,
  camZ: 0,
  dissolve: 0,
  severity: 0,
  morph: 0,
};

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#landing",
    start: "top top",
    end: "+=700%", // 7 écrans de scroll
    scrub: 1, // scrub amorti, JAMAIS d'ease sur un scrub
    pin: false, // le canvas est déjà fixe : pas besoin d'épingler
  },
});
```

### 10.2 Découpage scène par scène

Caméra : `PerspectiveCamera` fov 35, near 0.1, far 200. Sujet centré à l'origine, hauteur 1.7 m.

| #   | Progression | Nom                  | Caméra (pos → cible)                                   | Objet actif                              | Uniformes                         | Texte DOM                        | Post FX                                  |
| --- | ----------- | -------------------- | ------------------------------------------------------ | ---------------------------------------- | --------------------------------- | -------------------------------- | ---------------------------------------- |
| 1   | 0.00 → 0.11 | **Ouverture froide** | `[0, 1.2, 14]` → `[0, 1.2, 9]`, regard `[0,1.2,0]`     | tracé ECG seul, se dessinant             | `uHead` avance, `uAmp` 0→1        | titre + accroche                 | bloom 0.5, vignette forte                |
| 2   | 0.11 → 0.25 | **Émergence**        | `[0, 1.2, 9]` → `[1.6, 1.5, 4.2]`                      | corps s'assemblant depuis les particules | `uProgress` 0→1, `uDissolve` 1→0  | « Le patient, en entier »        | DOF entre, bloom 0.85                    |
| 3   | 0.25 → 0.40 | **Flux vital**       | `[1.6, 1.5, 4.2]` → `[0.2, 1.4, 0.55]` (quasi contact) | réseau vasculaire, travelling intérieur  | flux d'UV ×3, `plasma` monte      | 3 métriques en surimpression     | DOF bokeh 4.2, aberration ×1.6           |
| 4   | 0.40 → 0.55 | **Le service**       | recul rapide → `[0, 9, 18]`, léger plongeon            | `WardGrid` : 180 lits instanciés         | `uProgress` grille 0→1 en cascade | « 180 lits. Une seule vue. »     | DOF sort, bloom 0.7                      |
| 5   | 0.55 → 0.68 | **L'alarme**         | coupe sèche → `[-3.2, 2.1, 5.4]` sur un lit            | un lit passe en crimson, god rays        | `uSeverity` 0→1 en 250 ms         | bandeau d'alerte, chrono         | **Glitch 400 ms**, désaturation du reste |
| 6   | 0.68 → 0.84 | **Intervention**     | orbite lente autour du patient                         | panneaux HUD s'assemblant en 3D          | `uMorph` 0→0.35                   | cartes de constantes qui entrent | retour au normal, bloom 0.9              |
| 7   | 0.84 → 1.00 | **Élévation**        | recul continu → `[0, 2, 42]`                           | constellation multi-établissements       | `uMorph` →1, particules → sphère  | proposition de valeur + CTA      | bloom 1.0, grain 0.045                   |

### 10.3 Règles de chorégraphie

- **Recouvrement obligatoire.** Chaque scène commence 0.02 de progression avant la fin de la précédente. Aucune coupe nette sauf scène 5, où la coupe est l'effet recherché.
- **Une seule idée par scène.** Un mouvement de caméra dominant + un évènement visuel dominant. Deux idées simultanées = illisible.
- **La caméra ne fait jamais deux choses à la fois.** Elle avance, ou elle orbite, ou elle recule. Jamais avance + orbite + roulis.
- **Pas de roulis de caméra** (`rotation.z`), sauf 1.5° maximum en scène 5 pour créer le malaise. Le roulis provoque du mal des transports.
- **Texte et 3D ne bougent jamais ensemble.** Le texte entre pendant que la caméra est en phase lente. Sinon, rien n'est lisible.
- **Trajectoire de caméra** : définir un `CatmullRomCurve3` par scène et échantillonner par `curve.getPointAt(t)` plutôt que d'interpoler des positions clés — le mouvement est immédiatement plus cinématographique.
- **Échappatoire toujours disponible** : le scroll natif n'est jamais confisqué, `Échap` ou un bouton « Passer l'introduction » saute directement à la progression 0.84.
- **Ancres SEO** : chaque scène correspond à une `<section>` DOM réelle avec son titre `h2` et son texte, présents dans le HTML servi.

---

## 11. Dashboard soignant

### 11.1 Charpente

```
┌────┬──────────────────────────────────────────┬──────────────────┐
│    │  Bandeau d'alarme (§11.4) — 0 ou 64px    │                  │
│ R  ├──────────────────────────────────────────┤  Colonne         │
│ a  │                                          │  constantes      │
│ i  │   SCÈNE PRINCIPALE                       │  (Couche Vitale, │
│ l  │   <View> jumeau numérique                │   DOM pur)       │
│    │   ou grille de service                   │                  │
│ 72 │                                          │  6 blocs         │
│ px │                                          │  VitalNumber     │
│    ├──────────────────────────────────────────┤  + SignalRibbon  │
│    │  Frise temporelle scrubbable — 96px      │  en <View>       │
└────┴──────────────────────────────────────────┴──────────────────┘
```

Densité cible : 9 à 14 blocs d'information par vue (§2.3). Colonne de constantes : 348 px fixe, jamais fluide — les valeurs vitales ne se réagencent pas selon la largeur.

### 11.2 Anatomie d'un bloc

Chaque bloc est un composant DOM qui contient une `<View>` 3D. Ordre de superposition interne, du fond vers l'avant : panneau de verre chanfreiné (`--glass-*`, `--chamfer-lg`) ; ancre de `<View>` (le rendu 3D apparaît dedans) ; écran de contraste `--scrim` en dégradé sur les 40 % bas ; **Couche Vitale** : valeur en JetBrains Mono `--fs-vital-lg`, unité en `--ash`, delta et tendance ; liseré supérieur de 1 px en `--edge-lit` dont la couleur code l'état ; micro-label HUD en Chakra Petch en coin supérieur gauche ; horodatage et indicateur de fraîcheur en coin inférieur droit.

### 11.3 Interaction principale — sélection d'un patient

Enchaînement, à implémenter tel quel : survol d'un lit dans la grille → `uHover` monte (λ = 9.0), le jumeau DOM annonce le nom au lecteur d'écran, l'infobulle DOM apparaît en 120 ms → clic → la caméra rejoint le lit sur une courbe de Catmull-Rom en 1200 ms `power2.inOut`, simultanément `uMorph` de la grille descend et le jumeau numérique du patient monte en `uProgress` → à 60 % du trajet, la transition par déplacement (§8.7) couvre la substitution → la colonne de constantes se remplit bloc par bloc, décalage de 60 ms, `--ease-out-expo` → l'URL passe à `/patient/[id]` sans démonter le canvas.

Retour : `Échap` ou clic hors zone, séquence inverse en 900 ms.

### 11.4 Système d'alarme — spécification stricte

Le point le plus sensible du produit. Une alarme ne peut **jamais** dépendre d'un seul canal sensoriel ni d'un effet 3D.

Codage redondant obligatoire, les cinq simultanément : **texte** (libellé, valeur, seuil franchi, patient, horodatage, en DOM net) ; **couleur** (`--vital-amber` ou `--vital-crimson`) ; **forme** (icône distincte par priorité — jamais la même forme dans deux couleurs) ; **position** (bandeau en haut, hors du flux, toujours au même endroit) ; **mouvement** (pulsation ≤ 1 Hz).

Comportement 3D concomitant : le sujet concerné passe en `uSeverity = 1` sur 250 ms ; tout le reste de la scène se désature vers le monochrome via une passe de color grading (progression 0.65) — la mise en évidence par soustraction du contexte est plus forte que par addition de rouge ; les particules convergent vers le sujet ; la caméra ne se déplace pas d'elle-même. **Cadrer automatiquement sur l'alarme serait un défaut grave** : le soignant est peut-être en train de lire autre chose d'important. On signale, on ne détourne pas.

Interdits formels : clignotement supérieur à 1 Hz ou flash plein écran (seuil photosensible, §15.3) ; alarme signalée seulement par la 3D ; alarme qui disparaît d'elle-même sans acquittement tracé ; son déclenché automatiquement sans opt-in explicite ; `Glitch` en continu pendant l'alarme (400 ms d'accroche, puis état stable).

Accusé de réception : bouton en `--vital-cyan`, jamais rouge, à moins de 40 px du texte de l'alarme, atteignable au clavier en un `Tab` depuis le bandeau.

### 11.5 Fraîcheur du signal

Trois états, visibles simultanément en DOM et en 3D :

| État    | Délai  | DOM                                                   | 3D                                              |
| ------- | ------ | ----------------------------------------------------- | ----------------------------------------------- |
| Direct  | < 5 s  | point `--vital-mint` pulsant à 1 Hz                   | jumeau à pleine densité                         |
| Retardé | 5–30 s | horodatage en `--vital-amber` + « il y a Ns »         | nuage à 60 % de densité, désaturé de 30 %       |
| Perdu   | > 30 s | valeur **grisée et barrée**, mention « signal perdu » | nuage à 20 %, `uSeverity` neutre, coque fantôme |

Une valeur en état « perdu » n'est jamais affichée comme une valeur courante. Elle est explicitement marquée comme une dernière valeur connue, avec son heure.

---

## 12. Interaction souris et pointeur

### 12.1 Source unique

La position du pointeur vit dans le store zustand, normalisée `[-1, 1]`, mise à jour par un unique écouteur sur `window` avec `passive: true`. Aucun autre composant n'ajoute d'écouteur `pointermove`. L'amortissement se fait à la consommation, dans `useFrame`, avec `LAMBDA.mouse`.

### 12.2 Parallaxe de caméra

Décalage additif de ±0.35 unité en X, ±0.22 en Y, appliqué **après** la position dictée par le scroll, borné, amorti. Désactivé quand `Math.abs(scrollVelocity) > 0.4` (le scroll domine) et en mode Calme (§15.1). Sur tactile : désactivé, remplacé par une dérive automatique très lente de la caméra pour préserver le Pilier 3.

### 12.3 Raycasting

`OrbitControls` est **interdit sur la landing** (il casse la chorégraphie). Sur le dashboard, `OrbitControls` autorisé avec `enablePan={false}`, `minPolarAngle`/`maxPolarAngle` bornés à ±35° autour de l'horizon, `minDistance`/`maxDistance` bornés, `enableDamping` avec `dampingFactor = 0.06`, et remise à la pose canonique après 8 s d'inactivité.

Sur les `InstancedMesh` (grille de lits, nuage de cohorte), utiliser `e.instanceId` et **arrêter la propagation** (`e.stopPropagation()`). Limiter le raycast aux objets pertinents via `raycast={null}` sur tout ce qui est décoratif — le raycasting sur 150 000 points est une erreur de conception : n'exposer au raycast qu'une géométrie de collision simplifiée invisible.

### 12.4 Curseur, aimantation, traînée

**Curseur personnalisé** : point de 6 px `--vital-cyan`, suivi par `gsap.quickTo` (jamais par un state React), trois états — défaut (point), survol interactif (anneau de 32 px + libellé d'action), pressé (contraction à 0.8). Se replie sur le curseur natif quand `pointer: coarse`, et **toujours en mode Calme** : un curseur retardé est un obstacle pour certaines déficiences motrices.

**Boutons aimantés** : traction maximale de 8 px vers le curseur dans un rayon de 90 px, `gsap.quickTo` avec `duration: 0.35`. Uniquement sur les CTA de la landing. **Jamais sur un bouton d'action clinique** — un bouton qui bouge sous le doigt est inacceptable dans un contexte d'urgence.

**Traînée de curseur** : FBO en ping-pong, 256², où la position du curseur écrit un point avec décroissance de 0.94 par image ; la texture résultante alimente `uMouseTrail` du shader de fond pour un déplacement local. Tier ultra uniquement, landing uniquement.

---

## 13. Transitions de route

Le canvas ne se démonte jamais, donc une navigation n'est pas un rechargement mais un **mouvement de caméra plus une substitution de scène**.

Séquence canonique, 900 ms :

| t      | Événement                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------- |
| 0 ms   | Le contenu DOM sortant part en `opacity 1→0` + `translateY 0→-12px`, 220 ms, `--ease-out-quart`   |
| 120 ms | La caméra amorce son déplacement vers la pose canonique de la route cible, `power2.inOut`         |
| 200 ms | Le voile de transition (§8.7) monte `uProgress` 0→0.5                                             |
| 450 ms | Pic : flash de bloom 120 ms + aberration chromatique ×3 ; **la scène est échangée à cet instant** |
| 450 ms | `router.push` est déjà résolu ; le nouveau DOM est monté mais à `opacity: 0`                      |
| 500 ms | Le voile descend `uProgress` 0.5→1                                                                |
| 620 ms | Le nouveau contenu DOM entre, décalage de 50 ms par bloc, `--ease-out-expo`                       |
| 900 ms | Fin ; la caméra est en pose canonique, le voile est retiré du DOM                                 |

Chaque route déclare sa pose canonique de caméra dans un registre unique `lib/cameraPoses.ts` (`position`, `target`, `fov`). Une route sans pose déclarée doit faire échouer le build.

La View Transitions API peut être utilisée **pour la couche DOM uniquement**, en complément et non en remplacement — elle ne sait rien du canvas. Ne pas en faire dépendre la transition principale.

Cas particulier : une **alarme critique interrompt toute transition en cours**. Le voile est retiré immédiatement, le bandeau d'alarme s'affiche, la navigation se termine sans effet. La sécurité passe avant la chorégraphie, toujours.

---

## 14. Budgets de performance

### 14.1 Contrat chiffré

| Indicateur                                       | Landing                         | Dashboard | Plancher acceptable |
| ------------------------------------------------ | ------------------------------- | --------- | ------------------- |
| Images par seconde (desktop, GPU intégré récent) | 60                              | 60        | 45 soutenu          |
| Images par seconde (mobile haut de gamme)        | 45                              | 30        | 24                  |
| Appels de rendu (draw calls)                     | ≤ 180                           | ≤ 120     | —                   |
| Triangles à l'écran                              | ≤ 1.2 M                         | ≤ 600 k   | —                   |
| Programmes de shaders compilés                   | ≤ 40                            | ≤ 30      | —                   |
| Poids total des GLB                              | ≤ 4 Mo                          | ≤ 3 Mo    | —                   |
| Poids HDRI                                       | ≤ 1.5 Mo (2k, `.hdr` ou KTX2)   | idem      | —                   |
| Textures                                         | ≤ 2048², KTX2/Basis obligatoire | idem      | —                   |
| JS initial (hors 3D, `gzip`)                     | ≤ 180 ko                        | ≤ 220 ko  | —                   |
| Premier rendu utile (LCP DOM)                    | ≤ 2.0 s                         | ≤ 2.0 s   | 2.5 s               |
| Première image 3D                                | ≤ 3.5 s                         | ≤ 3.0 s   | —                   |
| Mémoire GPU (onglet)                             | ≤ 400 Mo                        | ≤ 350 Mo  | —                   |

**Le DOM ne doit jamais attendre la 3D.** Le texte, les valeurs et la navigation sont interactifs avant que le canvas n'ait produit sa première image. Le canvas monte en `<Suspense>` derrière un fond dégradé statique qui reprend `--void` → `--deep`, de sorte que l'apparition soit imperceptible.

### 14.2 Qualité adaptative — trois tiers

Détection à l'amorçage : chaîne `WEBGL_debug_renderer_info`, `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `pointer: coarse`, puis **mesure réelle** sur les 90 premières images. La mesure prime sur la détection matérielle. Bascule par `<PerformanceMonitor>` de Drei avec hystérésis (ne jamais remonter de tier moins de 10 s après une descente, pour éviter le battement).

| Réglage                    | `ultra`                 | `standard`             | `eco`                               |
| -------------------------- | ----------------------- | ---------------------- | ----------------------------------- |
| `dpr`                      | `[1, 2]`                | `[1, 1.5]`             | `[1, 1]`                            |
| Particules                 | 120 000                 | 45 000                 | 15 000                              |
| Points du jumeau           | 150 000                 | 60 000                 | 20 000                              |
| `DepthOfField`             | oui                     | non                    | non                                 |
| `Bloom`                    | mipmapBlur, radius 0.72 | mipmapBlur, radius 0.5 | intensité 0.5, sans mipmap          |
| `ChromaticAberration`      | oui                     | oui, offset ÷2         | non                                 |
| `Noise` / `Vignette`       | oui                     | oui                    | vignette seule                      |
| `SMAA`                     | oui                     | oui                    | non                                 |
| `MeshTransmissionMaterial` | 2 instances, 8 samples  | 1 instance, 4 samples  | remplacé par `MeshPhysicalMaterial` |
| `ContactShadows`           | 512                     | 256                    | désactivé                           |
| Environnement              | HDRI 2k                 | HDRI 1k                | HDRI 512                            |
| Traînée de curseur (FBO)   | oui                     | non                    | non                                 |
| God rays                   | oui                     | non                    | non                                 |

Le tier est exposé dans un réglage utilisateur (Auto / Ultra / Standard / Éco), persisté en `localStorage`. Un soignant sur un poste ancien doit pouvoir forcer `eco` sans discussion.

### 14.3 Règles de code non négociables en boucle de rendu

Ces erreurs sont la cause de 90 % des chutes de performance sur ce type de projet :

- **Aucune allocation dans `useFrame`.** Pas de `new THREE.Vector3()`, pas de littéral d'objet, pas de `.map()`, pas de `.filter()`. Tous les vecteurs de travail sont créés hors du composant, en module, et réutilisés.
- **Aucun `setState` dans `useFrame`.** Muter une `ref`, ou passer par le store zustand en lecture directe (`useStore.getState()`), sans abonnement réactif.
- **Aucune lecture du DOM dans `useFrame`** (`getBoundingClientRect`, `offsetWidth`) : cela force un recalcul de mise en page. Mesurer dans un `ResizeObserver` et mettre en cache.
- Géométries et matériaux mémorisés (`useMemo`) et explicitement libérés (`dispose()`) au démontage.
- `matrixAutoUpdate = false` sur tout objet statique.
- Regroupement systématique via `InstancedMesh` / `<Instances>` dès qu'un même mesh apparaît plus de 8 fois.
- `renderOrder` et `depthWrite: false` explicites sur tous les matériaux transparents et additifs, sinon le tri produit des scintillements aléatoires.
- Textures : `colorSpace` correct (`SRGBColorSpace` pour les couleurs, `NoColorSpace` pour les cartes de données), `generateMipmaps` désactivé sur les textures de données.
- Un seul `three` dans l'arbre : `npm ls three` doit renvoyer une entrée unique.

### 14.4 Instrumentation

`r3f-perf` et `leva` montés uniquement si `process.env.NODE_ENV === "development"`, dans un composant importé dynamiquement pour qu'ils soient exclus du bundle de production. Vérifier leur absence par une analyse du bundle avant chaque livraison. Un panneau de debug expédié en production sur un produit de santé est un défaut de livraison.

### 14.5 WebGPU

Hors périmètre de la version 1. Écrire le code de manière à ne pas fermer la porte : aucune dépendance à `WebGL1`, pas de `gl.getExtension` en dur, shaders isolés dans `shaders/` pour faciliter un futur portage. Prévoir un drapeau `?renderer=webgpu` en phase 8 avec repli automatique sur WebGL2. Ne pas y consacrer d'effort avant que le reste ne soit terminé et dans les budgets.

---

## 15. Accessibilité et sécurité d'usage

Cette section n'est pas une formalité. Sur un produit de surveillance médicale, l'accessibilité et la sécurité d'usage sont des exigences fonctionnelles, et la plupart d'entre elles améliorent aussi le rendu.

### 15.1 Mode Calme — `prefers-reduced-motion: reduce`

Détecté automatiquement, également accessible par un réglage manuel. Effets : caméra fixe en pose canonique, aucun mouvement piloté par le scroll ; aucune parallaxe souris ; particules figées (rendues, mais `uTime` gelé) ; `Glitch`, `ChromaticAberration` et `Noise` désactivés ; bloom réduit à 0.4 ; transitions de route ramenées à un fondu de 200 ms ; curseur personnalisé désactivé ; pulsations d'alarme remplacées par un liseré statique plus épais.

**Exigence de parité de contenu** : aucune information n'existe uniquement dans une animation. Tout ce qui est révélé par le scroll doit être présent et lisible en mode Calme. Un test automatisé compare le texte accessible dans les deux modes (§18).

### 15.2 Mode Clinique — repli 2D total

Bascule explicite dans l'interface, persistée, **et activée automatiquement** si l'une de ces conditions est remplie : WebGL indisponible ou contexte perdu ; images par seconde < 20 pendant 5 s consécutives ; `deviceMemory` < 2 Go ; paramètre d'URL `?mode=clinical` ; politique d'établissement (variable d'environnement).

En mode Clinique : zéro WebGL, canvas non monté, tracés en SVG (le même tampon circulaire alimente un `path` SVG), jumeau numérique remplacé par un schéma corporel SVG statique avec pastilles de valeurs, mêmes tokens de couleur et même sémantique, densité d'information **identique ou supérieure**.

Ce mode n'est pas une version dégradée honteuse : c'est le mode que choisiront certains services, et il doit être soigné. Le construire en phase 7, pas « un jour ».

### 15.3 Photosensibilité

Contrainte dure, à traiter comme un test bloquant : **aucun clignotement au-delà de 1 Hz**, aucun flash couvrant plus de 25 % du viewport, aucune inversion de luminance rapide. Le flash de transition (§13) est unique, de 120 ms, et ne se répète pas. Le `Glitch` d'alarme est plafonné à 400 ms et ne se rejoue pas avant 10 s. Toute pulsation d'alarme est bornée à 1 Hz avec une amplitude de luminance inférieure à 20 %.

### 15.4 Couche proxy d'accessibilité

Tout objet 3D interactif possède un élément DOM correspondant, positionné au même endroit, transparent mais focusable : `<button>` avec `aria-label` complet (« Lit 14, Mme M., fréquence cardiaque 122, alarme »), navigable au `Tab` dans l'ordre de lecture, contour de focus visible de 2 px en `--vital-cyan` avec 2 px de décalage. Actionner ce bouton déclenche exactement la même action que le clic 3D. Le survol au clavier pilote le même uniforme `uHover`.

Sans cette couche, le dashboard est inutilisable au clavier et invisible pour un lecteur d'écran, ce qui est disqualifiant pour un marché hospitalier.

### 15.5 Contrastes et lisibilité

Valeurs vitales : contraste ≥ 7:1 sur leur fond effectif (mesuré **avec** le rendu 3D derrière, pas sur le token de fond théorique). Texte courant : ≥ 4.5:1. Micro-labels HUD : ≥ 4.5:1, ce qui interdit `--ash` sur `--deep` en 11 px — utiliser `--mist`. Tout texte posé sur de la 3D en mouvement reçoit `--scrim` ou un `backdrop-filter: blur(12px)`. Jamais d'information portée par la seule couleur : toujours doublée par du texte ou une forme. Taille minimale de texte : 12 px, 14 px pour tout ce qui est clinique. Cibles tactiles : 44×44 px minimum.

### 15.6 Divers

Ne jamais désactiver le zoom navigateur ; l'interface doit rester utilisable à 200 %. Respecter `prefers-contrast: more` par une variante de tokens à contraste renforcé (bordures plus opaques, `--mist` remplacé par `--bone`). Aucun son sans opt-in explicite. Le focus n'est jamais volé par une animation.

---

## 16. Données de démonstration

Un jumeau numérique alimenté par des valeurs plates est un mauvais argumentaire. `lib/vitals/synth.ts` doit produire des signaux physiologiquement crédibles.

**ECG** : somme de gaussiennes reproduisant le complexe P-QRS-T. Onde P (amplitude 0.12, σ 0.022, à t = −0.16 du R), Q (−0.10, σ 0.006, −0.03), R (1.0, σ 0.009, 0), S (−0.22, σ 0.008, +0.025), T (0.28, σ 0.045, +0.20). Période = 60/FC. Ajouter une variabilité sinusale de ±3 % pilotée par la respiration (le rythme s'accélère à l'inspiration — détail que les cliniciens remarquent), plus un bruit blanc à 0.5 % et une dérive de ligne de base très basse fréquence.

**Pléthysmogramme (SpO₂)** : pic systolique asymétrique avec encoche dicrote, synchronisé sur l'ECG avec 180 ms de retard.

**Respiration** : période 60/FR, asymétrique (inspiration 40 % du cycle, expiration 60 %).

**Scénarios scriptés** pour la démonstration, sélectionnables par paramètre d'URL : `stable`, `desaturation` (SpO₂ 98 → 88 % en 40 s), `tachycardia` (FC 78 → 140 en 25 s), `sensor_loss` (perte de signal à t+15 s — indispensable pour démontrer le comportement de la §11.5), `recovery`. Chaque scénario dure moins de 90 s et boucle.

Aucune donnée réelle, même anonymisée, dans le dépôt. En-tête de fichier explicite : `// SYNTHETIC DATA — for demonstration only, not derived from any patient record.`

---

## 17. Roadmap d'implémentation

À suivre dans l'ordre. Chaque phase a une définition de « terminé » vérifiable ; ne pas entamer la suivante avant de l'avoir atteinte.

**Phase 0 — Fondations.** Projet Next.js, Tailwind, polices, `tokens.css` + `tokens.ts` synchronisés, règle de lint interdisant l'import croisé DOM ↔ three, `package.json` avec versions résolues et épinglées, triplet noté dans le `README`.
_Terminé quand_ : une page affiche l'intégralité des tokens (nuancier, échelle typographique, chanfreins, lueurs) et `npm ls three` renvoie une entrée unique.

**Phase 1 — Canvas persistant.** `CanvasRoot`, `Lights`, `Atmosphere`, `Rig`, une `<View>` de test, `ScrollProvider` (Lenis + ScrollTrigger), store zustand, détection de tier.
_Terminé quand_ : on navigue entre trois routes sans perte de contexte WebGL, avec un cube holographique visible dans une `<View>` ancrée, à 60 fps, et le tier détecté s'affiche.

**Phase 2 — Bibliothèque de shaders.** Chunks de la §8.1/8.2, `HoloMaterial`, système de particules, `SignalRibbon`, shader de transition. Page de démonstration interne `/dev/shaders` avec contrôles `leva` sur tous les uniformes du contrat.
_Terminé quand_ : chaque uniforme du contrat §8.3 est manipulable et produit l'effet décrit, et un `SignalRibbon` alimenté par `synth.ts` défile à 60 fps en 20 instances simultanées.

**Phase 3 — Jumeau numérique.** Chaîne d'assets (§9.2), les quatre couches, `bindings.ts`, y compris la dégradation par fraîcheur.
_Terminé quand_ : les cinq scénarios de la §16 produisent chacun une réaction visuelle distincte et immédiatement identifiable, `sensor_loss` compris.

**Phase 4 — Landing.** Sept scènes, timeline maîtresse, courbes de caméra, textes DOM en `<section>`, échappatoire.
_Terminé quand_ : le scroll complet est fluide sur les trois tiers, chaque scène est atteignable par ancre, le texte est intégralement présent dans le HTML servi, et Lighthouse dépasse 85 en performance sur la landing.

**Phase 5 — Dashboard.** Charpente, blocs `VitalPanel` + `<View>`, `WardGrid`, `CohortCloud`, `SignalRibbon` en colonne, frise temporelle, sélection de patient (§11.3).
_Terminé quand_ : 180 lits s'affichent en moins de 120 appels de rendu, la sélection d'un patient est fluide de bout en bout, et 14 blocs coexistent à 60 fps.

**Phase 6 — Alarmes et interactions.** Système d'alarme complet (§11.4), fraîcheur (§11.5), raycasting, curseur, aimantation, transitions de route (§13).
_Terminé quand_ : une alarme injectée respecte les cinq canaux redondants, est acquittable au clavier seul, et interrompt correctement une transition en cours.

**Phase 7 — Performance, accessibilité, mode Clinique.** Trois tiers effectifs, mode Calme, mode Clinique 2D, couche proxy d'accessibilité, audit des contrastes, test de photosensibilité.
_Terminé quand_ : la checklist §18 passe intégralement, y compris un parcours complet au clavier seul et un parcours complet en mode Clinique.

**Phase 8 — Finition.** God rays, traînée de curseur FBO, morphose vers la constellation, micro-interactions, éventuel drapeau WebGPU.
_Terminé quand_ : rien de la checklist n'a régressé.

---

## 18. Critères d'acceptation

À vérifier avant toute livraison. Un seul point non satisfait bloque la livraison.

**Loi de la Couche Vitale**

- [ ] Aucune valeur vitale rendue en 3D — recherche de `Text`, `Text3D`, `troika` dans le code : zéro occurrence dans un contexte de donnée clinique.
- [ ] Capture d'écran de chaque vue : tout chiffre vital est net, non flouté, non affecté par le bloom.
- [ ] Tout texte sur fond 3D possède un `--scrim` ou un `backdrop-filter`.

**Sémantique chromatique**

- [ ] `--vital-crimson` et `--vital-amber` n'apparaissent nulle part en usage décoratif (audit par recherche dans le code, chaque occurrence justifiée).
- [ ] Aucune information portée par la couleur seule.

**Performance**

- [ ] Budgets §14.1 respectés sur les trois tiers, mesurés et consignés.
- [ ] `useFrame` : aucune allocation, aucun `setState`, aucune lecture du DOM (revue manuelle de chaque occurrence).
- [ ] Aucune fuite : naviguer 20 fois entre les routes, la mémoire GPU revient à son niveau initial.
- [ ] `r3f-perf` et `leva` absents du bundle de production (vérifié par analyse du bundle).
- [ ] Onglet en arrière-plan pendant 5 minutes : consommation processeur quasi nulle au retour, aucune alarme perdue.

**Accessibilité**

- [ ] Parcours complet au clavier seul : landing, dashboard, sélection de patient, acquittement d'alarme.
- [ ] Chaque objet 3D interactif a son proxy DOM avec `aria-label` significatif.
- [ ] Contrastes : ≥ 7:1 sur les valeurs vitales, ≥ 4.5:1 ailleurs, mesurés sur rendu réel.
- [ ] `prefers-reduced-motion` : parité de contenu vérifiée automatiquement.
- [ ] Aucun clignotement > 1 Hz, aucun flash > 25 % du viewport (revue image par image d'une capture vidéo).
- [ ] Utilisable à 200 % de zoom.

**Sécurité d'usage clinique**

- [ ] Scénario `sensor_loss` : la valeur est barrée, datée, et le jumeau se délite visiblement.
- [ ] Une alarme ne déplace jamais la caméra automatiquement.
- [ ] Une alarme survit à une transition de route en cours.
- [ ] Aucune alarme ne se referme sans acquittement tracé.
- [ ] Mode Clinique : parcours complet réalisable, densité d'information équivalente.
- [ ] Bascule automatique en mode Clinique effectivement déclenchée en simulant une perte de contexte WebGL.

**Cohérence**

- [ ] `tokens.css` et `tokens.ts` identiques (test automatisé).
- [ ] Aucune valeur magique : audit des littéraux numériques dans les composants de rendu.
- [ ] Aucun import croisé DOM ↔ three (règle de lint active et vérifiée).
- [ ] Licence de chaque asset 3D documentée.

**Direction artistique**

- [ ] Minimum 4 couches visuelles à l'écran sur chaque vue.
- [ ] Aucun aplat de couleur nulle part.
- [ ] Un seul élément détient l'accent lumineux maximal par vue.
- [ ] Aucun écran figé : tout état statique conserve une respiration.

---

## 19. Anti-patterns interdits

Liste noire. Chacun de ces points a une raison précise ; ne pas les contourner.

**Architecture** : monter un `<Canvas>` par route ou par widget ; monter le canvas côté serveur ; deux versions de `three` dans l'arbre ; configurer un loader `.glsl` ; faire coexister GSAP et `react-spring` ; réimplémenter le bruit ou le Fresnel ailleurs que dans `shaders/lib/`.

**Boucle de rendu** : allouer dans `useFrame` ; `setState` dans `useFrame` ; lire la mise en page dans `useFrame` ; interpoler sans tenir compte de `delta` ; animer une valeur React depuis GSAP.

**3D** : `OrbitControls` sur la landing ; plus de deux `MeshTransmissionMaterial` ; shadow maps généralisées ; raycast sur un nuage de 150 000 points ; `frames={Infinity}` sur `Environment` sans nécessité démontrée ; transparence sans `renderOrder` ni `depthWrite: false` ; `Text3D` pour une donnée.

**Interaction** : confisquer le scroll natif sans échappatoire ; désactiver le zoom ; bouton aimanté sur une action clinique ; curseur personnalisé sans repli tactile ni mode Calme ; cadrer automatiquement la caméra sur une alarme ; infobulle qui masque une valeur vitale.

**Clinique** : afficher une valeur périmée comme courante ; alarme sur un seul canal sensoriel ; alarme auto-refermée ; son automatique ; clignotement > 1 Hz ; flou ou bloom sur un chiffre ; rouge ou ambre décoratif ; donnée patient réelle dans le dépôt ; allégation diagnostique dans le contenu.

**Livraison** : `leva` ou `r3f-perf` en production ; GLB non compressé ; texture non KTX2 ; HDRI 4k ; asset sans licence documentée ; panneau de debug accessible en production.

---

## 20. Correspondance des concepts demandés

Chaque concept du brief initial et son emplacement concret dans ce projet. Sert de contrôle de couverture : rien n'a été laissé de côté, rien n'a été ajouté sans usage.

| Concept                                              | Où il vit dans VITALIS                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| WebGL, WebGL2                                        | Cible de rendu du canvas unique, §6                                                                       |
| Three.js, R3F, Drei                                  | Stack, §4.1 ; architecture, §6                                                                            |
| WebGPU                                               | Drapeau optionnel de phase 8, §14.5                                                                       |
| GLSL, shaders, vertex, fragment                      | Bibliothèque complète, §8                                                                                 |
| Shader materials, custom shaders                     | `HoloMaterial` via CSM, §8.3                                                                              |
| GPU rendering / acceleration                         | Ruban de signal en `DataTexture`, §8.6 ; particules, §8.5                                                 |
| Scene graph, caméras perspective/ortho               | §6.2, §7 ; ortho pour la vue de service en plongée                                                        |
| Lighting, Environment map, HDRI, PBR                 | `Lights.tsx` avec Lightformers, §7.1                                                                      |
| Materials, textures, normal / displacement maps      | §7.1, §8.3, chaîne KTX2 §9.2                                                                              |
| GLTF, GLB, GLTFLoader, Draco                         | Chaîne d'assets, §9.2                                                                                     |
| Mesh, BufferGeometry, vertices, faces                | §9.1                                                                                                      |
| Particles, point cloud, GPU particles                | §8.5, couche 1 du jumeau §9.1                                                                             |
| Instanced mesh                                       | `WardGrid` (180 lits, 1 appel), `CohortCloud`, §11                                                        |
| Morph targets                                        | Morphose corps → constellation, §9.4                                                                      |
| Skeletal animation, rigging                          | **Hors périmètre** — le corps ne marche pas ; écarté volontairement                                       |
| Spline 3D                                            | Écarté au profit d'un GLB maîtrisé (contrôle du poids et de la licence)                                   |
| Blender → Three.js                                   | §9.2                                                                                                      |
| Scroll-driven / scroll-linked / storytelling         | Landing 7 scènes, §10                                                                                     |
| Immersive / cinematic web experience                 | §2, §10                                                                                                   |
| GSAP, ScrollTrigger, timeline, easing                | §10.1, §3.7                                                                                               |
| Lerp, damping, spring, physics-based                 | `dampf` indépendant du framerate, §3.8                                                                    |
| Camera animation, dolly, fly-through, path           | Courbes Catmull-Rom, §10.2/10.3, registre §13                                                             |
| Animation sequencing, choreography                   | §10.2, §11.3, §13                                                                                         |
| Mouse tracking, parallax, pointer                    | §12.1, §12.2                                                                                              |
| Raycasting, 3D object interaction                    | §12.3                                                                                                     |
| Custom cursor, magnetic buttons, cursor follower     | §12.4 (avec restrictions cliniques)                                                                       |
| Mouse displacement / distortion                      | Traînée FBO, §12.4, tier ultra                                                                            |
| Interactive particles                                | Répulsion `uMouse`, §8.5                                                                                  |
| Fluid simulation, metaballs, blob                    | Écarté : coût GPU non justifié ; le bruit `fbm` et le flux vasculaire donnent la même sensation organique |
| Perlin / simplex noise, noise distortion             | Chunk `noise.ts`, §8.1                                                                                    |
| Vertex displacement, UV distortion                   | §8.3 vertex, §8.7                                                                                         |
| RGB split, chromatic aberration                      | Pile de post-processing, §8.8                                                                             |
| Glitch, digital glitch                               | Alarme uniquement, 400 ms max, §8.8/§11.4                                                                 |
| Bloom, glow, lens flare                              | §8.8 ; lens flare écarté (illisible sur de la donnée)                                                     |
| Depth of field, motion blur                          | DOF landing/ultra ; motion blur écarté (nausée + coût)                                                    |
| Film grain, vignette, color grading                  | §8.8 ; grading de désaturation à l'alarme, §11.4                                                          |
| Post-processing                                      | §8.8                                                                                                      |
| Volumetric lighting, god rays                        | §7.2, scène 5, tier ultra                                                                                 |
| Fresnel, refraction, reflection, glass, liquid glass | §8.2, §8.3, §8.4                                                                                          |
| Holographic shader                                   | `HoloMaterial`, §8.3 — matériau signature                                                                 |
| Dissolve shader                                      | `uDissolve`, §8.3 ; assemblage scène 2                                                                    |
| Fire / water / terrain shader                        | Écartés : hors registre médical                                                                           |
| Procedural textures / shaders                        | `fbm` sur fond et surfaces, §7.2, §8.3                                                                    |
| Shader / liquid / displacement transition            | §8.7, §13                                                                                                 |
| View Transitions API                                 | Couche DOM uniquement, §13                                                                                |
| Scene transitions, scroll snapping                   | §10.3, §13                                                                                                |
| Creative coding, generative / computational design   | §2.2 Pilier 3, §8.5, §16                                                                                  |
| Immersive UX / UI, interactive storytelling          | §10, tempéré par la Loi de la Couche Vitale §1.3                                                          |
| Motion design / motion UI                            | §3.7, §3.8                                                                                                |

---

## 21. Gabarits de prompts pour l'agent

À réutiliser tels quels pendant le développement, pour rester aligné sur ce document.

**Nouveau composant 3D**

> Implémente `components/<chemin>/<Nom>.tsx` conformément à DESIGN.md §<n>. Contraintes : `"use client"` ; aucune allocation ni `setState` dans `useFrame` ; toutes les couleurs depuis `lib/tokens.ts` ; réutilise les chunks de `shaders/lib/` sans en réécrire ; respecte le contrat d'uniformes §8.3 ; expose les paramètres à `leva` en développement uniquement ; les valeurs cliniques restent en DOM. Puis indique les appels de rendu ajoutés et les images par seconde mesurées sur le tier standard.

**Nouveau bloc de dashboard**

> Implémente le bloc `<Nom>` selon §11.2. Structure : coque DOM en verre chanfreiné, ancre de `<View>`, `--scrim`, Couche Vitale en JetBrains Mono tabulaire avec unité et fraîcheur, liseré d'état, micro-label HUD. Aucun import de `three` dans le fichier DOM. Ajoute le proxy d'accessibilité §15.4. Vérifie ensuite les contrastes sur rendu réel.

**Nouveau shader**

> Écris `shaders/<dossier>/<nom>.ts` en chaîne de gabarit avec le commentaire `/* glsl */`. Compose depuis `shaders/lib/`. Documente chaque uniforme dans un tableau en tête de fichier. Ajoute une entrée dans `/dev/shaders` avec des contrôles `leva` sur tous les uniformes et leurs bornes. Précise la compatibilité GLSL 1 / GLSL 3.

**Revue de phase**

> Passe la checklist §18 sur ce qui vient d'être construit. Pour chaque point : satisfait, non satisfait, ou non applicable avec justification. Mesure et consigne les indicateurs de la §14.1 sur les trois tiers. Ne déclare aucune phase terminée si un point de sa définition de « terminé » manque.

---

## Annexe A — Résumé exécutable en dix règles

À garder sous les yeux. Si tu ne retiens que cela :

1. **La donnée clinique est en DOM, net, au-dessus du canvas. Toujours.**
2. Un seul canvas, monté une fois, jamais démonté. Les vues se projettent dedans par `<View>`.
3. Rouge et ambre ne sont jamais décoratifs.
4. Rien n'est immobile ; rien n'est un aplat ; quatre couches minimum à l'écran.
5. Un seul élément détient l'accent lumineux maximal par vue.
6. Aucune allocation, aucun `setState`, aucune lecture du DOM dans `useFrame`.
7. Quand le signal se perd, le visuel doit visiblement se déliter.
8. Une alarme signale sur cinq canaux et ne déplace jamais la caméra.
9. Trois tiers de qualité, plus un mode Calme, plus un mode Clinique 2D. Tous soignés.
10. Aucun clignotement au-delà de 1 Hz.

---

_Fin du document. Toute modification de cette spécification doit être datée et justifiée en tête de fichier._
