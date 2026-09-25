Title: Package flutter_facebook_auth:macos references facebook_auth_desktop:macos but that package is missing or not a plugin

**Description**

When building my app I see the following error repeated:

```
Package flutter_facebook_auth:macos references facebook_auth_desktop:macos as the default plugin, but the package does not exist, or is not a plugin package.
```

**Environment**
- `flutter_facebook_auth: ^6.0.4` (from pub.dev)
- Flutter on Windows (repro'd while launching `lib/main.dart` on web/Edge)

**Reproduction steps**
1. Add `flutter_facebook_auth: ^6.0.4` to `pubspec.yaml`
2. Run `flutter pub get` and build or run the app
3. Observe the error above in the build output

**Why this is a problem**
- The `platforms: macos: default_package: facebook_auth_desktop` mapping instructs pub that a package named `facebook_auth_desktop` provides the macOS implementation.
- If the referenced package does not exist on pub.dev or is not a plugin with a `plugin:` configuration for macOS, consumers receive this error and builds can fail or the tooling emits warnings.

**Suggested fixes (pick one)**
- Remove the `default_package` reference from `platforms: macos` in `flutter_facebook_auth`'s `pubspec.yaml`, so the package does not require a default implementation that may not exist. Example change:

```diff
- platforms:
-   macos:
-     default_package: facebook_auth_desktop
-     pluginClass: FlutterFacebookAuthPlugin
+ platforms:
+   macos:
+     pluginClass: FlutterFacebookAuthPlugin
```

- Or publish/create a plugin package named `facebook_auth_desktop` that includes a valid `plugin:` section with macOS implementation so the default package mapping is valid.

**Temporary workarounds for consumers**
- If `facebook_auth_desktop` exists in the pub cache and actually implements macOS, add it as an explicit dependency or `dependency_overrides` in your app `pubspec.yaml` (then run `flutter pub get`). Example:

```yaml
dependencies:
  facebook_auth_desktop: ^2.1.1 # or the version in your cache
```

- Or point `flutter_facebook_auth` to a forked repo where the `platforms: macos` default package mapping was removed until upstream fixes it:

```yaml
flutter_facebook_auth:
  git:
    url: https://github.com/yourname/flutter_facebook_auth
    ref: fix/remove-macos-default
```

**Additional context**
- Please add CI checks to validate plugin `platforms`/`default_package` references so future releases don't point to missing packages.

---

If you'd like, I can:
- open this issue on your behalf on the `flutter_facebook_auth` GitHub repo (I cannot post without your GitHub account/session), or
- try the quick local workaround (add `facebook_auth_desktop` dependency override and run a build) and report results.

Let me know which you'd prefer.