# Apple Sign In - Guide de Dépannage
## Résolution de l'erreur "Unknown Error Occurred"

---

## 🔍 Diagnostic de l'Erreur

L'erreur "Unknown error occurred" lors de la connexion Apple peut avoir plusieurs causes. Suivez ce guide étape par étape.

---

## ✅ Checklist de Vérification

### 1. **Vérifiez que vous êtes sur un VRAI appareil iOS**

❌ **NE FONCTIONNE PAS sur simulateur**
✅ **DOIT être testé sur iPhone/iPad réel**

```bash
# Pour tester sur appareil réel
flutter run
# Sélectionnez votre iPhone/iPad connecté
```

**Vérification:**
- Connectez votre iPhone/iPad via USB
- Assurez-vous qu'il apparaît dans Xcode
- iOS 13.0 ou supérieur requis

---

### 2. **Vérifiez la connexion iCloud**

L'appareil DOIT être connecté à un compte Apple ID.

**Sur votre iPhone/iPad:**
1. Ouvrez **Réglages**
2. Tapez sur votre nom en haut
3. Vérifiez que vous êtes **connecté à iCloud**
4. Si pas connecté → **Se connecter**

**Message d'erreur si non connecté:**
> "Sign in with Apple is not available on this device"

---

### 3. **Vérifiez Apple Developer Portal**

**Étape 1: Vérifier la capability**
1. Allez sur https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Sélectionnez votre Bundle ID (ex: `com.skedisy.customer`)
4. Vérifiez que **"Sign in with Apple"** est ✅ **ACTIVÉ**
5. Si non activé → Cochez la case → **Save**

**Étape 2: Vérifier le Bundle ID**
- Le Bundle ID dans Apple Developer **DOIT** correspondre exactement au Bundle ID dans Xcode
- Pas d'espace, pas de typo

---

### 4. **Vérifiez Xcode Configuration**

**Ouvrir le projet:**
```bash
cd dev/flutter/multi_salon_customer/ios
open Runner.xcworkspace
```

**Vérifications dans Xcode:**

#### A. Signing & Capabilities
1. Sélectionnez **"Runner"** dans le navigateur de projet
2. Onglet **"Signing & Capabilities"**
3. Vérifiez:
   - ✅ Team est sélectionné
   - ✅ Bundle Identifier est correct
   - ✅ **"Sign in with Apple"** capability est présente
   
**Si "Sign in with Apple" n'est pas présent:**
1. Cliquez sur **"+ Capability"**
2. Cherchez **"Sign in with Apple"**
3. Double-cliquez pour l'ajouter

#### B. Entitlements File
1. Vérifiez que `Runner.entitlements` contient:
```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

2. Si absent, le fichier est ici:
```
dev/flutter/multi_salon_customer/ios/Runner/Runner.entitlements
```

---

### 5. **Vérifiez Firebase Console**

**Si vous utilisez Firebase Auth:**

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet **Skedisy**
3. **Authentication** → **Sign-in method**
4. Trouvez **"Apple"** dans la liste
5. Vérifiez qu'il est **Activé**
6. Vérifiez que votre **Bundle ID iOS** est listé

**Si non activé:**
1. Cliquez sur **Apple**
2. **Enable**
3. Ajoutez votre Bundle ID
4. **Save**

---

### 6. **Vérifiez les Logs**

Après avoir cliqué sur "Apple Sign In", regardez les logs:

```bash
flutter run
# Cliquez sur le bouton Apple
# Regardez la console
```

**Logs attendus:**
```
[log] Starting Apple Sign In process...
[log] Apple Sign In available: true
[log] Apple Credential :: ...
[log] Apple Email :: user@example.com
```

**Si vous voyez:**
```
[log] Apple Sign In available: false
```
→ Problème: Appareil non connecté à iCloud ou simulateur

**Si vous voyez:**
```
[log] Apple Sign In Authorization Error: unknown - ...
```
→ Problème de configuration (voir étapes 3 et 4)

---

## 🐛 Erreurs Courantes et Solutions

### Erreur 1: "Sign in with Apple is not available"
**Cause:** Simulateur ou pas connecté à iCloud
**Solution:** 
- Utilisez un vrai appareil iOS
- Connectez-vous à iCloud dans Réglages

### Erreur 2: "Unknown error occurred"
**Causes possibles:**
1. Capability pas activée dans Apple Developer
2. Capability pas ajoutée dans Xcode
3. Bundle ID ne correspond pas
4. Entitlements file manquant ou incorrect

**Solution:** Suivez les étapes 3 et 4 ci-dessus

### Erreur 3: "Sign in failed. Please ensure Sign in with Apple is enabled"
**Cause:** Configuration Apple Developer
**Solution:** Vérifiez étape 3

### Erreur 4: "Invalid response from Apple"
**Cause:** Problème de nonce ou configuration Firebase
**Solution:** 
- Vérifiez Firebase est configuré (étape 5)
- Reconstruisez l'app: `flutter clean && flutter pub get`

### Erreur 5: "Apple Sign In is not enabled. Please contact support"
**Cause:** Firebase n'a pas Apple activé
**Solution:** Activez Apple dans Firebase Console (étape 5)

---

## 🔧 Procédure de Rebuild Complète

Si le problème persiste, faites un rebuild complet:

```bash
# 1. Nettoyer le projet
cd dev/flutter/multi_salon_customer
flutter clean

# 2. Récupérer les dépendances
flutter pub get

# 3. Nettoyer iOS
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..

# 4. Rebuild
flutter run
```

---

## 📱 Test Étape par Étape

### Test 1: Vérifier l'Appareil
```bash
flutter devices
```
**Attendu:** Votre iPhone/iPad doit apparaître dans la liste

### Test 2: Vérifier la Disponibilité
Ajoutez ce code temporaire dans `signInWithApple()`:
```dart
dev.log("Platform: ${Platform.operatingSystem}");
dev.log("Platform version: ${Platform.operatingSystemVersion}");
```

### Test 3: Tester la Méthode
1. Lancez l'app
2. Cliquez sur "Apple"
3. Regardez les logs dans la console
4. Notez le message d'erreur exact

---

## 📋 Informations à Fournir pour le Support

Si le problème persiste après tous ces tests, fournissez:

1. **Version iOS:** ___________
2. **Type d'appareil:** iPhone ___ / iPad ___
3. **Connecté à iCloud:** Oui / Non
4. **Bundle ID:** ___________
5. **Logs complets de l'erreur:**
```
[Collez les logs ici]
```
6. **Capability activée dans Apple Developer:** Oui / Non
7. **Capability présente dans Xcode:** Oui / Non

---

## ✅ Configuration Correcte

Voici ce que vous devriez avoir si tout est configuré correctement:

### Apple Developer Portal ✅
- [ ] Sign in with Apple capability activée
- [ ] Bundle ID correct

### Xcode ✅
- [ ] Runner.entitlements contient Sign in with Apple
- [ ] Capability visible dans Signing & Capabilities
- [ ] Team sélectionné
- [ ] Bundle ID correct

### Firebase Console ✅
- [ ] Apple provider activé
- [ ] Bundle ID iOS ajouté

### Appareil ✅
- [ ] iPhone/iPad réel (pas simulateur)
- [ ] iOS 13.0+
- [ ] Connecté à iCloud

### Code ✅
- [ ] `sign_in_with_apple` package installé
- [ ] Méthode `signInWithApple()` implémentée
- [ ] Bouton Apple dans l'UI

---

## 🎯 Commandes de Debug Rapide

```bash
# Vérifier la version Flutter
flutter --version

# Vérifier les appareils connectés
flutter devices

# Analyser le code
flutter analyze

# Voir les logs en temps réel
flutter run --verbose

# Rebuilder complètement
flutter clean && flutter pub get && cd ios && pod install && cd .. && flutter run
```

---

## 📞 Ressources Supplémentaires

- **Apple Documentation:** https://developer.apple.com/sign-in-with-apple/
- **Package Flutter:** https://pub.dev/packages/sign_in_with_apple
- **Firebase Auth:** https://firebase.google.com/docs/auth/ios/apple

---

## 💡 Astuce Finale

**L'erreur la plus courante est d'oublier d'activer la capability dans Apple Developer Portal.**

Vérifiez d'abord cela avant tout autre diagnostic!

---

**Document créé:** Octobre 2025  
**Version:** 1.0

