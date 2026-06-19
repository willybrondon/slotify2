# iOS CI — profils de provisioning (Skedisy Customer)

## Erreur typique CI

```
Provisioning profile "appstore-skedisy-customer" doesn't include the
com.apple.developer.applesignin and com.apple.security.application-groups entitlements.
```

Le binaire demande des **entitlements** (`Runner/Runner.entitlements`) que le profil App Store n’inclut pas encore.

## État actuel CI vs fonctionnalités complètes

| Fichier | Usage |
|---------|--------|
| `Runner/Runner.entitlements` | **CI / App Store actuel** — notifications push uniquement (`aps-environment`) |
| `Runner/Runner.full.entitlements` | **Après mise à jour des profils Apple** — Sign In with Apple + App Groups |

Quand les profils sont à jour :

```bash
cp ios/Runner/Runner.full.entitlements ios/Runner/Runner.entitlements
```

Puis réactiver la Share Extension dans Xcode (voir `CAPTURE_SHARE_IOS.md`) et ajouter le profil `appstore-skedisy-customer-share` au secret CI.

## Correctif Apple Developer (pour fonctionnalités complètes)

### 1. App ID principal `com.skedisy.customer`

Sur [developer.apple.com](https://developer.apple.com) → Identifiers → `com.skedisy.customer` :

- activer **Sign In with Apple**
- activer **App Groups** → créer / cocher `group.com.skedisy.customer`

### 2. App ID extension `com.skedisy.customer.ShareExtension`

- créer l’identifiant **App Groups** : `group.com.skedisy.customer`
- type : **App Extension** ou bundle `com.skedisy.customer.ShareExtension`
- activer **App Groups** (même groupe)

### 3. Regénérer les profils Distribution

| Profil | Bundle ID | Nom suggéré |
|--------|-----------|-------------|
| App | `com.skedisy.customer` | `appstore-skedisy-customer` |
| Share Extension | `com.skedisy.customer.ShareExtension` | `appstore-skedisy-customer-share` |

Télécharger les deux `.mobileprovision`.

### 4. Mettre à jour le secret GitHub `BUILD_PROVISION_PROFILE_BASE64`

```bash
tar czvf mobile_pp.tgz appstore-skedisy-customer.mobileprovision appstore-skedisy-customer-share.mobileprovision
base64 -i mobile_pp.tgz | pbcopy   # macOS — coller dans GitHub Secrets
```

Le workflow CI extrait tous les `.mobileprovision` du tarball dans `~/Library/MobileDevice/Provisioning Profiles/`.

### 5. Vérifier localement

```bash
security cms -D -i appstore-skedisy-customer.mobileprovision | grep -A20 Entitlements
```

Doit contenir au minimum :

- `com.apple.developer.applesignin`
- `com.apple.security.application-groups` → `group.com.skedisy.customer`
- `aps-environment`

## Share Extension (Xcode)

Target **Share Extension** → Release → `PROVISIONING_PROFILE_SPECIFIER` = `appstore-skedisy-customer-share`

Puis :

```bash
cd ios && pod install
```

## Expert app

`multi_salon_expert` n’utilise que `aps-environment` dans `Runner.entitlements` — pas de Share Extension.
