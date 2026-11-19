# Android release route

LocalRoulette is currently a PWA, not an APK or Android App Bundle. The proposed Play Store route is a Trusted Web Activity (TWA) around the production HTTPS app.

1. Deploy to a stable HTTPS domain and test the manifest, service worker, icons and responsive layouts on real Android devices.
2. Choose the final application ID and create a protected release signing key outside this repository.
3. Use Bubblewrap or Android Studio to create a TWA wrapper pointing to the final origin.
4. Publish `/.well-known/assetlinks.json` with the package ID and signing certificate SHA-256 fingerprint, then verify Digital Asset Links.
5. Test install, launch, deep links, back navigation, offline state, location permission, sharing and external links on several phones.
6. Add final store assets, operator and support details, privacy policy, content rating and data-safety declaration in Play Console. Submit a signed AAB to internal testing before production review.

Do not submit until live content, provider permissions, legal copy and phone flows are verified.
