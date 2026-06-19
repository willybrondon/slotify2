# iOS — Partager vers Skedisy (Share Extension)

Android : fonctionne via les intent-filters `SEND` dans `AndroidManifest.xml`.

**iOS** : la Share Extension est intégrée dans `Runner.xcodeproj` (target `Share Extension`).

## Prérequis Apple Developer (une fois)

1. App Group `group.com.skedisy.customer` activé pour :
   - `com.skedisy.customer` (app)
   - `com.skedisy.customer.ShareExtension` (extension)
2. Après clone / mise à jour iOS :
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

- **Skedisy absent de la liste** : vérifier que l’extension est embarquée (Build Phases → Embed Foundation Extensions) et que l’App Group est identique sur les deux targets.
- **No such module `receive_sharing_intent`** : `pod install`, puis placer « Embed Foundation Extensions » **au-dessus** de « Thin Binary » dans Runner → Build Phases.
