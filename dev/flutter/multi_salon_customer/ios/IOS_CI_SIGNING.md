# iOS CI — profils de provisioning (Skedisy Customer)

## Profils attendus dans `BUILD_PROVISION_PROFILE_BASE64`

| Nom du profil | Bundle ID | Cible |
|---------------|-----------|--------|
| `appstore-skedisy-customer` | `com.skedisy.customer` | App Runner |
| `appstore-skedisy-customer-share` | `com.skedisy.customer.ShareExtension` | Share Extension (Partager → Skedisy) |
| `appstore-skedisy-expert` | (expert) | App expert (même tarball CI) |

```bash
tar czvf mobile_pp.tgz \
  appstore-skedisy-customer.mobileprovision \
  appstore-skedisy-customer-share.mobileprovision \
  appstore-skedisy-expert.mobileprovision
base64 -i mobile_pp.tgz | pbcopy
```

## Entitlements app (`Runner/Runner.entitlements`)

- `aps-environment` (production)
- `com.apple.developer.applesignin`
- `com.apple.security.application-groups` → `group.com.skedisy.customer`

## Xcode — Share Extension

- Target **Share Extension** embarquée dans Runner (`Embed Foundation Extensions`, avant Thin Binary)
- Release : `PROVISIONING_PROFILE_SPECIFIER` = `appstore-skedisy-customer-share`

```bash
cd ios && pod install
```

## Test sur appareil

1. Build / install IPA customer depuis CI `dev`
2. Capture ou photo dans **Photos**
3. **Partager** → **Skedisy**
4. L’app s’ouvre sur « Partager un look »

Voir aussi `CAPTURE_SHARE_IOS.md`.
