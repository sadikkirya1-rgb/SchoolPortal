# Firebase setup

The Firebase client is configured for the `delivery-app-6a47f` project and the `smartskool` Hosting site (`https://smartskool.web.app`). Hosting stages the root app files into `public/` before deployment; do not use that generated directory for source edits. Firebase web configuration is public; authorization must be enforced by Firestore, Storage, and callable-function rules, never by hiding UI controls.

## Provision Firebase

1. In Firebase Console, enable **Authentication → Email/Password**, create the Firestore database, and enable Storage.
2. Sign in to the Firebase CLI, then deploy the repository configuration:

   ```sh
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
   ```

   Cloud Functions deployment requires a billing-enabled Firebase project. Review and test the rules with the Firebase Emulator before deploying them to a production school.
3. Create your initial App Admin Auth user in Firebase Console. Find its Authentication UID, then grant the restricted App Admin custom claim from a trusted environment that has Firebase Admin SDK dependencies and Google Application Default Credentials:

   ```sh
   gcloud auth application-default login
   npm --prefix functions install
   node scripts/grant-app-admin.js FIREBASE_AUTH_UID
   ```

   Protect this script and App Admin account as platform-owner credentials. Never add a callable that lets users grant themselves this claim.
4. Open `https://smartskool.web.app/platform-admin.html`, sign in as the App Admin, and create a school. The first school created by this panel on 8 October 2026 will receive `SCH-0001-UG-08102026`. The sequence increments atomically; the date suffix is UTC `DDMMYYYY`. The panel writes the school document with `status: "active"` and optional HTTPS `logoURL`.
5. Create the first school administrator using **Authentication → Add user**, then add a corresponding Firestore document using that Authentication UID:

   ```text
   schools/{GENERATED_SCHOOL_ID}/members/{AUTH_UID}
     role: "schoolAdmin"
     status: "active"
     fullName: "School Administrator"
     userId: "admin"
     email: "admin@example.com"
     phone: ""
     sections: []
     permissions: {}
     notificationPreferences: {}
   ```

   This one-time school-admin bootstrap is done in the Firebase Console because client rules intentionally prohibit creating or elevating school administrator memberships. Store the school ID in `schools/{schoolId}` and membership data in `schools/{schoolId}/members/{authUid}`; the school ID is the visible tenant identifier, while the Auth UID remains the secure account document key.
6. Sign in using the generated School ID, the administrator's email, and password. Use the User Roles screen to provision non-administrator school accounts.

## Current implementation boundary

- School lookup, email/password sign-in, school membership checks, account provisioning/status/deletion callables, profile updates, and profile-photo uploads use Firebase.
- `firebase-data.js` provides a school-and-user-scoped IndexedDB cache/outbox and versioned Firestore synchronization API. It is a foundation, not yet wired to the existing feature modules.
- Most school feature screens still use their existing browser-local data. Those records remain local and are not automatically uploaded. Migrate them through an explicit, reviewed school import or a collection-by-collection conversion; do not bulk-copy browser storage into Firestore.
- Offline edits made through `schoolPortalData` remain queued locally. Conflicts are saved for review, but a conflict-review screen and migration of existing modules are still outstanding.
- User Roles section selections hide navigation only. Data authorization comes from the server-managed role permissions in `functions/index.js` and Firestore Rules.
- Test Firestore/Storage rules and account callables with the Firebase Emulator before real school data is entered. Do not treat a successful Hosting deploy as proof that role or record-level rules are correct.
