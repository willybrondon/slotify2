# iOS CI — profils de provisioning (Skedisy Customer)

## Profils attendus dans `BUILD_PROVISION_PROFILE_BASE64`

Les noms **exacts** sur Apple Developer (sans tirets) :

| Nom du profil | Bundle ID | Cible |
|---------------|-----------|--------|
| `appstoreskedisycustomer` | `com.skedisy.customer` | App Runner |
| `appstoreskedisycustomershare` | `com.skedisy.customer.ShareExtension` | Share Extension (Partager → Skedisy) |
| `appstoreskedisyexpert` | (expert) | App expert (même tarball CI) |

```bash
tar czvf mobile_pp.tgz \
  appstoreskedisycustomer.mobileprovision \
  appstoreskedisycustomershare.mobileprovision \
  appstoreskedisyexpert.mobileprovision
base64 -i mobile_pp.tgz | pbcopy
```

> Le nom affiché dans le portail Apple est celui utilisé par Xcode (`PROVISIONING_PROFILE_SPECIFIER`), pas forcément le nom du fichier `.mobileprovision`.

## Entitlements app (`Runner/Runner.entitlements`)

- `aps-environment` (production)
- `com.apple.developer.applesignin`
- `com.apple.security.application-groups` → `group.com.skedisy.customer`

## Xcode — Share Extension

- Target **Share Extension** embarquée dans Runner (`Embed Foundation Extensions`, avant Thin Binary)
- Release : `PROVISIONING_PROFILE_SPECIFIER` = `appstoreskedisycustomershare`

```bash
cd ios && pod install
```

## Test sur appareil

1. Build / install IPA customer depuis CI `dev`
2. Capture ou photo dans **Photos**
3. **Partager** → **Skedisy**
4. L’app s’ouvre sur « Partager un look »

Voir aussi `CAPTURE_SHARE_IOS.md`.
