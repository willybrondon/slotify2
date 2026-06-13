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

## Test — capture d’écran

1. Capture d’écran dans Photos ou Instagram
2. **Partager** → **Skedisy**
3. L’app s’ouvre sur « Réserver ce look » avec analyse automatique

## Test — enregistrement d’écran (TikTok, Instagram, Snapchat, Facebook)

Les apps sociales ne permettent souvent **pas** de partager une vidéo directement. Le flux recommandé :

1. Ouvre la vidéo (TikTok, Reels, Story Snapchat, etc.)
2. **Enregistre l’écran** (iOS : Centre de contrôle → Enregistrement d’écran)
3. Arrête l’enregistrement → la vidéo est dans **Photos**
4. Ouvre la vidéo dans Photos → **Partager** → **Skedisy**
5. Skedisy extrait la coiffure et propose des salons afro en IDF

> Skedisy analyse uniquement le fichier que tu partages. Aucun accès à tes comptes sociaux.
