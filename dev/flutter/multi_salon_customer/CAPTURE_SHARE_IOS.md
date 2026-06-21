# iOS — Partager vers Skedisy (Share Extension)

Android : fonctionne via les intent-filters `SEND` dans `AndroidManifest.xml`.

**iOS (CI `dev`)** : Share Extension embarquée dans l’IPA (`PlugIns/Share Extension.appex`). Profils requis : `appstore-skedisy-customer` + `appstore-skedisy-customer-share` (voir `ios/IOS_CI_SIGNING.md`).

## Prérequis Apple Developer (une fois)

1. App Group `group.com.skedisy.customer` activé pour :
   - `com.skedisy.customer` (app)
   - `com.skedisy.customer.ShareExtension` (extension)
2. **URL scheme** dans `Runner/Info.plist` : `ShareMedia-com.skedisy.customer` (obligatoire pour rouvrir l’app après partage)
3. Après clone / mise à jour iOS :
   ```bash
   cd ios && pod install
   ```
3. Ouvrir `ios/Runner.xcworkspace` (pas `.xcodeproj`)
4. Build sur **appareil réel** (le partage système ne s’affiche pas toujours sur simulateur)

## Test — capture d’écran

1. Capture dans Photos ou depuis une app
2. **Partager** → **Skedisy**
3. L’app s’ouvre sur « Partager un look » avec analyse automatique

## Test — vidéo (TikTok, Instagram, etc.)

1. Enregistre l’écran pendant la vidéo
2. Ouvre la vidéo dans **Photos** → **Partager** → **Skedisy**

> Skedisy n’accède qu’au fichier partagé, pas à vos comptes sociaux.

## Dépannage

- **Partager → Skedisy : rien ne se passe** : l’extension doit ouvrir l’URL `ShareMedia-com.skedisy.customer:share` (pas `…customer.Share`). Vérifier `HostAppBundleIdentifier` = `com.skedisy.customer` dans `Share Extension/Info.plist` et le scheme dans `Runner/Info.plist`. Sur **iOS 18+**, la redirection utilise `UIApplication.open` via la responder chain (voir `RSIShareViewController.redirectToHostApp`).
- **Skedisy absent de la liste** : vérifier que l’extension est embarquée (Build Phases → Embed Foundation Extensions) et que l’App Group est identique sur les deux targets.
- **No such module `receive_sharing_intent`** : l’extension n’importe plus le pod Flutter ; les sources `RSIShareViewController.swift` et `ReceiveSharingIntentTypes.swift` sont compilées directement dans le target Share Extension. Vérifier aussi que « Embed Foundation Extensions » est **au-dessus** de « Thin Binary ».
