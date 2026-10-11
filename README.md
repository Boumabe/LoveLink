# LoveLink v2 — guide de mise en place

## Pourquoi on change de version d'Expo
Depuis le **31 août 2026**, Google Play refuse toute nouvelle app ou mise à jour qui ne cible pas **Android 16 (API 36)**.
Ton projet était sur Expo 50 (cible API 34) : impossible à publier. Cette version passe sur **Expo SDK 56** (React Native 0.85).

## Ce que contient cette version
- S'ouvre directement sur **Se divertir** ; 5 onglets : Jouer · Jardin · Messages · Couple 👑 · Profil
- **Association unique** des deux téléphones (code à 6 caractères, une seule fois) — fini les codes à chaque partie
- **Mode Couple premium** (abonnement Google Play via RevenueCat ; un abonnement = les deux téléphones)
- **Arbre du couple** : on l'arrose chaque jour ; si on oublie, il perd des fleurs (jamais de taille) ; rappel du soir
- **Messages personnalisés** (profil + occasion + ton) à partager ; IA en ligne, modèles prêts hors-ligne
- Base Firebase **sécurisée** (connexion anonyme + règles : seuls les 2 membres d'un couple lisent leurs données)

## Étapes (dans l'ordre)

### 1. Remplacer les fichiers
Dans ton dépôt : supprime `node_modules`, `package-lock.json`, `server.js` et l'ancien `App.js`,
puis décompresse tout le contenu de `LoveLink-v2.zip` à la racine (`unzip -o LoveLink-v2.zip`).

### 2. Installer
```
npm install
```
(Expo Go ne suffit plus : le paiement et les notifications demandent un « development build », voir étape 7.)

### 3. Remplir `src/config.js`
- `FIREBASE_API_KEY` : console Firebase › ⚙️ Paramètres du projet › « Clé API Web »
- `API_BASE` : l'adresse de ton projet Vercel
- `REVENUECAT_ANDROID_KEY` : voir étape 6

### 4. Firebase (sécurité) — **dans cet ordre**
1. Authentication › Méthode de connexion › activer **Anonyme**
2. Realtime Database › Règles › coller le contenu de `database.rules.json` › Publier
   (⚠️ publie les règles seulement après l'étape 1 et la clé API, sinon l'app n'aura plus accès à la base)

### 5. Vercel
Settings › Environment Variables : `GEMINI_API_KEY` (comme avant) › Redeploy.
Le site web est maintenant construit par `npx expo export -p web` (dossier `dist`, déjà réglé dans `vercel.json`).

### 6. Paiement (Google Play + RevenueCat)
1. Play Console › Monétiser › **Abonnements** › créer `lovelink_couple_monthly` › plan de base mensuel › (option) offre d'essai gratuit.
2. revenuecat.com › nouveau projet › ajouter l'app Android (nom de package `com.boumabe.lovelink`, à confirmer) › connecter les identifiants du compte de service Google Play.
3. Importer le produit › créer l'**entitlement** `premium` › créer l'**offering** `default` avec le package **Monthly**.
4. Copier la clé publique Android (`goog_…`) dans `src/config.js`.
5. Play Console › Paramètres de licence › ajouter ton e-mail comme **testeur de licence** (achats gratuits en test).
> Pour tester le mode Couple sans payer : `DEV_UNLOCK_PREMIUM: true` dans `src/config.js` (remets `false` avant de publier).

### 7. Construire et tester sur téléphone
```
npx eas-cli build -p android --profile development   # APK de test (paiement + notifications)
npx eas-cli build -p android --profile production    # .aab pour Google Play
```
Les achats ne fonctionnent que si l'app est installée **depuis Google Play** (piste « Test interne »).

### 8. Test à deux téléphones
1. A : Jouer › Associer nos téléphones › Inviter → code. B : saisir le code (se valide tout seul).
2. A lance un jeu → B voit « A t'attend ! » → Rejoindre.
3. Jardin : chacun arrose ; le lendemain, ne pas arroser → l'arbre perd des fleurs.
4. Couple : verrouillé tant que non abonné.

## À savoir
- **Identité anonyme** : si quelqu'un efface les données de l'app, il perd son lien de couple (évolution possible : lier un e-mail).
- **MonCash** : Google Play impose son propre paiement pour débloquer du contenu numérique dans l'app ; MonCash ne peut pas servir à ça sans risquer le retrait de l'app. Google Play accepte Haïti comme pays vendeur (USD).
- Le fuseau de l'arbre est celui du créateur du couple (important pour la diaspora : un « jour » est le même pour les deux).

## Architecture
```
App.js, index.js              point d'entrée
src/config.js                 clés et réglages (SEUL fichier à remplir)
src/Root.js                   démarrage, onglets, pile d'écrans, retour Android
src/state/                    AppContext (profil, couple, premium, arbre) · nav
src/services/                 fb (Firebase REST + auth) · pairing · tree (logique pure, testée)
                              messages · purchases(.native) · notifications · storage
src/screens/                  Hub · Garden · Messages · CoupleTab · Profile · Onboarding · Pairing · LiveSession
src/ui/                       tokens (design) · primitives · TreeArt (arbre SVG) · TabBar
src/games/                    Quiz · Devine · Vérité ou Défi · Mode Couple (+ contenu partagé)
src/i18n/                     fr · en · es · ht
api/                          question.js · message.js (Vercel, Gemini)
database.rules.json           règles de sécurité Firebase
scripts/test-logic.js         `npm test` : tests de la logique de l'arbre
```
