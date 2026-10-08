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
   Require multi-factor authentication for platform-owner accounts in Firebase Authentication settings, and grant the claim only to individually named operators.
   Suspending or removing a user's membership changes only that school's membership document. It deliberately does not disable or delete the Firebase Authentication identity, which may be shared across schools.
4. Open `https://smartskool.web.app/platform-admin.html` and sign in as the App Admin. The dashboard lists all registered schools using server pagination, provides per-school member counts, allows authorized school account provisioning/editing/suspension/deletion, and can suspend/reactivate a school. These account tools use callable Functions; the App Admin client has no direct Firestore bypass. The platform dashboard intentionally does not provide access to student, academic, medical, or financial records.
5. Create a school from the dashboard. The first school created by this panel on 8 October 2026 will receive `SCH-UG-0001-08102026`. The sequence increments atomically; the date suffix is UTC `DDMMYYYY`. The panel writes the school document with `status: "active"` and optional HTTPS `logoURL`.
6. After creating a school, the dashboard opens its account form with **School Admin** selected. Create the first school administrator there; after creation, use **Continue to school sign-in** to open the school login with its School ID filled and verified. Alternatively, use **Authentication → Add user** and a corresponding Firestore member document with that Authentication UID:

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
7. Sign in using the generated School ID, the administrator's email, and password. Use the User Roles screen to provision non-administrator school accounts.

## Current implementation boundary

- School lookup, email/password sign-in, school membership checks, account provisioning/status/deletion callables, profile updates, and profile-photo uploads use Firebase.
- `firebase-data.js` provides a school-and-user-scoped IndexedDB cache/outbox and versioned Firestore synchronization API. It is a foundation, not yet wired to the existing feature modules.
- Most school feature screens still use their existing browser-local data. Those records remain local and are not automatically uploaded. Migrate them through an explicit, reviewed school import or a collection-by-collection conversion; do not bulk-copy browser storage into Firestore.
- Home-page school, parent, student, and staff counters use aggregate counts from Firestore only. Parent/student/staff values count cloud records in the matching school subcollections; unsynced browser-local data is intentionally excluded, and a cloud error displays `—` rather than demo values.
- Offline edits made through `schoolPortalData` remain queued locally. Conflicts are saved for review, but a conflict-review screen and migration of existing modules are still outstanding.
- User Roles section selections hide navigation only. Data authorization comes from the server-managed role permissions in `functions/index.js` and Firestore Rules.
- Test Firestore/Storage rules and account callables with the Firebase Emulator before real school data is entered. Do not treat a successful Hosting deploy as proof that role or record-level rules are correct.
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

async function main() {
  const uid = 'WwJJgWnQGOP8PSSHRXQ6uC2gxdp2';
  const expectedEmail = 'sadikkirya@gmail.com';
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: 'delivery-app-6a47f'
  });
  const auth = getAuth(app);
  const user = await auth.getUser(uid);

  if (user.email?.toLowerCase() !== expectedEmail) {
    throw new Error(`UID email mismatch: found ${user.email || '(no email)'}`);
  }

  await auth.setCustomUserClaims(uid, {
    ...user.customClaims,
    appAdmin: true
  });

  console.log(`Granted appAdmin to ${user.email} (${uid}).`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});