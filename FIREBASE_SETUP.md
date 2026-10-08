# Firebase setup

The Firebase client is configured for the `delivery-app-6a47f` project. Firebase web configuration is public; authorization must be enforced by Firestore, Storage, and callable-function rules, never by hiding UI controls.

## Provision Firebase

1. In Firebase Console, enable **Authentication → Email/Password**, create the Firestore database, and enable Storage.
2. Sign in to the Firebase CLI, then deploy the repository configuration:

   ```sh
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
   ```

   Cloud Functions deployment requires a billing-enabled Firebase project. Review and test the rules with the Firebase Emulator before deploying them to a production school.
3. In Firestore, create a school document whose document ID is the school-facing ID (for example, `SCH-UG-2026`):

   ```text
   schools/SCH-UG-2026
     name: "Example School"
     status: "active"
   ```

   The public lookup document must not contain secrets.
4. Create the first administrator using **Authentication → Add user**, then add a corresponding Firestore document using that Authentication UID:

   ```text
   schools/SCH-UG-2026/members/{AUTH_UID}
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

   This one-time bootstrap is done in the Firebase Console because client rules intentionally prohibit creating or elevating administrator memberships. Store the school ID in `schools/{schoolId}` and membership data in `schools/{schoolId}/members/{authUid}`; the school ID is the visible tenant identifier, while the Auth UID remains the secure account document key.
5. Sign in using the school ID, the administrator's email, and password. Use the User Roles screen to provision non-administrator school accounts.

## Current implementation boundary

- School lookup, email/password sign-in, school membership checks, account provisioning/status/deletion callables, profile updates, and profile-photo uploads use Firebase.
- `firebase-data.js` provides a school-and-user-scoped IndexedDB cache/outbox and versioned Firestore synchronization API. It is a foundation, not yet wired to the existing feature modules.
- Most school feature screens still use their existing browser-local data. Those records remain local and are not automatically uploaded. Migrate them through an explicit, reviewed school import or a collection-by-collection conversion; do not bulk-copy browser storage into Firestore.
- Offline edits made through `schoolPortalData` remain queued locally. Conflicts are saved for review, but a conflict-review screen and migration of existing modules are still outstanding.
- User Roles section selections hide navigation only. Data authorization comes from the server-managed role permissions in `functions/index.js` and Firestore Rules.
- Test Firestore/Storage rules and account callables with the Firebase Emulator before real school data is entered. Do not treat a successful Hosting deploy as proof that role or record-level rules are correct.
