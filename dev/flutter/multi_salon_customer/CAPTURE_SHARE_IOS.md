# iOS — Partager vers Skedisy (Share Extension)

Android fonctionne après build. **iOS nécessite une étape Xcode** pour ajouter la Share Extension.

## Prérequis

- App Group `group.com.skedisy.customer` activé sur [Apple Developer](https://developer.apple.com) pour l’app **et** l’extension
- Fichiers déjà dans le repo : `ios/Share Extension/`

## Étapes Xcode (une fois)

1. Ouvrir `ios/Runner.xcworkspace` dans Xcode
2. **File → New → Target → Share Extension**
   - Product Name : `Share Extension`
   - Bundle ID : `com.skedisy.customer.ShareExtension`
3. Supprimer le `ShareViewController.swift` généré par Xcode
4. Glisser les fichiers du dossier `ios/Share Extension/` dans le target **Share Extension**
5. Target **Share Extension** → **Signing & Capabilities** → **App Groups** → cocher `group.com.skedisy.customer`
6. Target **Runner** → vérifier le même App Group
7. Build & run sur appareil réel

## Test

1. Capture d’écran dans Photos ou Instagram
2. **Partager** → **Skedisy**
3. L’app s’ouvre sur « Réserver ce look » avec analyse automatique
