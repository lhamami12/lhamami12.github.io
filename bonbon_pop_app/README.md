# Bonbon Pop — application Android (Flutter)

Ce projet emballe le jeu web `../match3/index.html` dans une application Android
(WebView) et y ajoute les publicités **Google AdMob** :

- **Interstitiel** entre les niveaux (jamais avant le niveau 3, un changement de
  niveau sur deux, au maximum une fois toutes les 90 s) ;
- **Récompensé** : sur l'écran « Plus de coups ! », une vidéo donne **+5 coups**
  (une fois par tentative) ;
- **Consentement UMP** (RGPD) au démarrage, et bouton « Choix de confidentialité
  des publicités » dans le menu pause.
- **Récompensé, autres usages** : +50 pièces dans la boutique (5 fois par jour) et
  cadeau du jour doublé.

Économie du jeu : pièces gagnées en finissant les niveaux et avec le cadeau du jour
(série de 7 jours), dépensées en boosters (marteau 120, mélange 80, +3 coups 150)
ou pour continuer un niveau perdu.

Autres fonctions de l'app (pont `AppBridge`) :

- **Avis Google Play** dans l'app (`in_app_review`) : demandé après une victoire à
  2 étoiles ou plus au niveau 8, puis une fois à partir du niveau 30 ;
- **Rappels quotidiens** (`flutter_local_notifications`) : « ton cadeau du jour
  t'attend », programmés à 19 h pour J+1, J+2, J+4 et J+7 et reprogrammés à chaque
  ouverture. La permission est demandée après la première victoire au niveau 3 ;
  désactivables dans les réglages du jeu (`lib/reminders.dart`).

Sur le site web, le pont `AdBridge` n'existe pas : aucune publicité n'est affichée.

> Depuis la version 1.3.1, les builds **release** (Play Store) utilisent les
> vrais blocs d'annonces Bonbon Pop ; les builds **debug** gardent les blocs de
> test de Google. Ne cliquez jamais sur vos propres annonces.

## Structure

| Fichier | Rôle |
| --- | --- |
| `lib/main.dart` | WebView plein écran, pont JavaScript `AdBridge`, liens externes ouverts dans le navigateur |
| `lib/reminders.dart` | Rappels quotidiens (notifications locales) |
| `lib/ads_manager.dart` | Consentement UMP, initialisation AdMob, préchargement et affichage des pubs |
| `lib/ad_config.dart` | Identifiants des blocs d'annonces (réels en release, test en debug) |
| `android/app/build.gradle.kts` | ID d'application, App ID AdMob, signature release |
| `assets/game/index.html` | Copie du jeu, à resynchroniser avec `tool/sync_game.sh` |
| `store/play_icon_512.png` | Icône 512×512 pour la fiche Play Store |

## Générer le .aab

### Avec GitHub Actions (recommandé, rien à installer)

Le workflow `.github/workflows/android-build.yml` se lance à chaque push qui
modifie l'app ou le jeu (ou manuellement : onglet **Actions → Android build → Run workflow**).

1. Dans GitHub : **Settings → Secrets and variables → Actions → New repository secret**,
   créez les 4 secrets de la clé d'upload :
   `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
2. Relancez le workflow.
3. Téléchargez **bonbon-pop-aab** (le `.aab` signé) et **bonbon-pop-apk** (APK de
   test à installer sur un téléphone) dans la section *Artifacts* de l'exécution.

Sans ces secrets, seul l'APK de test est produit.

### En local

Prérequis : Flutter 3.47+, Android SDK, JDK 17.

```sh
./tool/sync_game.sh            # copie ../match3/index.html dans les assets
flutter pub get
# android/key.properties (ne jamais le committer) :
#   storeFile=/chemin/vers/upload-keystore.jks
#   storePassword=...
#   keyAlias=upload
#   keyPassword=...
flutter build appbundle --release
# -> build/app/outputs/bundle/release/app-release.aab
```

## Avant de publier pour de vrai

1. **AdMob** : l'App ID (`admobAppId` dans `android/app/build.gradle.kts`) et
   les deux blocs d'annonces (`lib/ad_config.dart`) sont déjà ceux de Bonbon Pop.
   Une fois l'app publiée, associez-la à sa fiche Play Store dans AdMob
   (*Apps → Bonbon Pop → App settings → Add app store*).
2. **Version** : augmentez `version:` dans `pubspec.yaml` (actuellement `1.3.1+5`)
   à chaque nouvel envoi sur le Play Store.
3. **Play Console** :
   - *Contenu de l'application → Annonces* : « Oui, mon application contient des annonces » ;
   - *Identifiant publicitaire* : déclarez son utilisation (publicités) ;
   - *Sécurité des données* : déclarez la collecte par le SDK Google Mobile Ads
     (identifiants de l'appareil, données d'interaction avec les annonces, adresse IP approximative) ;
   - *Public cible* : 13 ans et plus (l'app n'est pas conçue pour les enfants) ;
   - *Règles de confidentialité* : `https://lhamami12.github.io/match3/privacy.html`.
4. **app-ads.txt** : le fichier à la racine du site doit contenir la ligne de votre
   compte AdMob (c'est déjà le cas pour `pub-3524601599534787` si c'est ce compte),
   et le site `lhamami12.github.io` doit être indiqué comme site web du développeur
   sur la fiche Play Store.

L'ID d'application `com.bonbon.pop` est définitif après le premier
envoi sur le Play Store : changez-le avant si vous en préférez un autre.
