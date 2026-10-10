# Bonbon Pop — application Android (Flutter)

Ce projet emballe le jeu web `../match3/index.html` dans une application Android
(WebView) et y ajoute les publicités **Google AdMob** :

- **Interstitiel** entre les niveaux (jamais avant le niveau 3, un changement de
  niveau sur deux, au maximum une fois toutes les 90 s) ;
- **Récompensé** : sur l'écran « Plus de coups ! », une vidéo donne **+5 coups**
  (une fois par tentative) ;
- **Consentement UMP** (RGPD) au démarrage, et bouton « Choix de confidentialité
  des publicités » dans le menu pause.

Sur le site web, le pont `AdBridge` n'existe pas : aucune publicité n'est affichée.

> ⚠️ Les identifiants AdMob actuels sont les **identifiants de test** de Google :
> ils affichent des pubs « Test Ad » et ne rapportent rien.

## Structure

| Fichier | Rôle |
| --- | --- |
| `lib/main.dart` | WebView plein écran, pont JavaScript `AdBridge`, liens externes ouverts dans le navigateur |
| `lib/ads_manager.dart` | Consentement UMP, initialisation AdMob, préchargement et affichage des pubs |
| `lib/ad_config.dart` | Identifiants des blocs d'annonces (test) |
| `android/app/build.gradle.kts` | ID d'application, App ID AdMob (test), signature release |
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

1. **AdMob** : créez l'application et deux blocs d'annonces (Interstitiel,
   Récompensé) dans AdMob, puis remplacez :
   - l'App ID dans `android/app/build.gradle.kts` (`admobAppId`) ;
   - les deux identifiants dans `lib/ad_config.dart`.
2. **Version** : augmentez `version:` dans `pubspec.yaml` (`1.0.0+1` → `1.0.1+2`…)
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

L'ID d'application `io.github.lhamami12.bonbon_pop` est définitif après le premier
envoi sur le Play Store : changez-le avant si vous en préférez un autre.
