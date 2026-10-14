# Firebase setup

The Firebase client is configured for the `delivery-app-6a47f` project and the `smartskool` Hosting site (`https://smartskool.web.app`). Hosting stages the root app files into `public/` before deployment; do not use that generated directory for source edits. Firebase web configuration is public; authorization must be enforced by Firestore, Storage, and callable-function rules, never by hiding UI controls.

## Provision Firebase

1. In Firebase Console, enable **Authentication → Email/Password**, create the Firestore database, and enable Storage. Add the Hosting domain to Authentication's authorized domains. This version uses email and password for administrator sign-in; TOTP MFA is not required. If TOTP MFA was previously enabled or enforced in Firebase Authentication, disable that project-level requirement too; Firebase project settings are separate from the portal code.
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
   Grant the claim only to individually named operators and protect those accounts with strong, unique passwords.
   Suspending or removing a user's membership changes only that school's membership document. It deliberately does not disable or delete the Firebase Authentication identity, which may be shared across schools.
4. Open `https://smartskool.web.app/platform-admin.html` and sign in as the App Admin. The dashboard lists all registered schools using server pagination, provides per-school member counts, allows authorized school account provisioning/editing/suspension/deletion, and can suspend/reactivate a school. These account tools use callable Functions; the App Admin client has no direct Firestore bypass. The platform dashboard intentionally does not provide access to student, academic, medical, or financial records.
5. Create a school from the dashboard. The first school created by this panel on 8 October 2026 will receive `SCH-UG-0001-08102026`. The sequence increments atomically; the date suffix is UTC `DDMMYYYY`. The panel writes the school document with `status: "active"` and optional HTTPS `logoURL`.
6. After creating a school, the dashboard opens its account form with **School Admin** selected. Set a temporary password and deliver it privately; the new administrator must change it at first sign-in. Use **Continue to school sign-in** to open the school login with its School ID filled and verified. The App Admin callable creates the Auth identity and membership together. For emergency bootstrap outside the dashboard, use a trusted Admin SDK script to create the account and membership with `mustChangePassword: true`, then set a temporary password through a trusted channel.

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

   The App Admin creates the first School Admin. An active School Admin may create additional School Admin accounts from User Roles; these accounts receive full school access and their management remains restricted to the App Admin. Store the school ID in `schools/{schoolId}` and membership data in `schools/{schoolId}/members/{authUid}`; the school ID is the visible tenant identifier, while the Auth UID remains the secure account document key.
7. Sign in using the generated School ID, the administrator's email, and password. Use the User Roles screen to provision staff, parent, student, or additional School Admin accounts. The linked-record selector loads existing student records for student/parent accounts and staff records for staff accounts, displaying each record's ID, name, and available department or class/section. Staff accounts may use manual ID entry if no directory record exists; this stores only the ID on the account and does not create a staff profile. Student and parent accounts must link to an existing student record. Set an initial temporary password meeting the stated complexity rules and deliver it privately. The user must choose a new password at first sign-in. Admin accounts are full-access and are not scoped by section, class, or individual data permissions.

## Mobile app installation and push notifications

The portal is a responsive installable web app (PWA); the same school account works in a mobile browser or from the installed app. Hosting must use HTTPS, and the deployed site includes the web manifest, app icon, and offline application shell.

To enable Firebase Cloud Messaging (FCM) web push:

1. In Firebase Console, open **Project settings → Cloud Messaging → Web configuration → Web Push certificates** and generate or copy the public VAPID key. Set `webPushVapidKey` in `firebase-config.js` to that public key. The key is safe to include in the web app; do not put a service-account credential or private key there.
2. Deploy Firestore Rules, Cloud Functions, and Hosting after setting the key:

   ```sh
   npx firebase-tools deploy --only firestore:rules,firestore:indexes,functions,hosting
   ```

3. Users sign in and tap the bell button on each device, then allow notifications in the browser. Each device registers its own FCM token; tokens are stored in a server-only member subcollection and can be removed from that device with the same button.

Push delivery is deliberately limited to generic, non-sensitive messages:

- A notice sends a push only when it is published with its **Browser Push** channel enabled; its audience selects parents, students, staff, or all users.
- Attendance notifications are sent to the linked student and parent accounts when an attendance entry is changed to absent, late, or tardy.
- Published assignments/assessments and report cards are sent to linked students and parents for the matching class or student. Stable class IDs and student links provide the most reliable targeting.

Push support requires a compatible browser and notification permission. On iPhone/iPad, install the portal from Safari using **Share → Add to Home Screen** first; web push requires iOS/iPadOS 16.4 or later. On Android and desktop browsers, use the browser's **Install app** or **Add to Home Screen** option. Users can also turn off the portal's push token on a device or revoke permission in browser settings.

Firebase Cloud Messaging has no separate per-message charge. Cloud Functions deployment and execution require a billing-enabled Firebase project; normal usage is subject to the project's current Functions, Firestore, and network quotas/pricing. Push is not sent by SMS, email, or to users who have not opted in on a device.

## Current implementation boundary

- School lookup, email/password sign-in, school membership checks, account provisioning/status/deletion callables, profile updates, and profile-photo uploads use Firebase.
- `firebase-data.js` provides a school-and-user-scoped IndexedDB cache/outbox, tenant-namespaced legacy browser cache, and versioned Firestore synchronization API. The Student directory uses the API directly; an explicit allowlist also bridges implemented module record arrays into Firestore when saved. Sessions, interface preferences, role-registry preview data, backup-prototype data, visitor correction audit arrays, and other non-record browser keys are intentionally excluded.
- On first login, the user is shown a school-specific review prompt listing existing allowlisted datasets before import. Individual datasets initialized after that prompt require their own confirmation before automatic sync is enabled. Review local data for sample/demo records before accepting. Offline writes remain queued in IndexedDB and are retried with backoff when connectivity returns; the app shell is cached by the service worker for later visits.
- Firestore snapshots hydrate tenant-scoped local stores for collections the user's role may view. Broad subscriptions are intentionally skipped for personal-record collections for non-admin roles because their rules require linked-student/class-specific query shapes. Parent/student personal records are refreshed through an authenticated callable that validates active membership, role, collection permission, and linked student IDs. Some legacy module records use names such as `className` where Firestore requires stable `classId`/linked-student IDs; those writes may remain queued until relationships are normalized.
- Home-page school, parent, student, and staff counters use aggregate counts from Firestore only. Parent/student/staff values count cloud records in the matching school subcollections; unsynced browser-local data is intentionally excluded, and a cloud error displays `—` rather than demo values.
- Offline edits made through the shared data API and allowlisted legacy bridge remain queued locally. Version conflicts are saved, but a conflict-resolution screen and user-facing retry for permission/schema failures are still outstanding.
- User Roles section selections can grant a whole department or individual modules within it; existing department-name grants remain supported. These selections control navigation, while collection-level view/edit/delete authorization comes from server-managed role permissions and Firestore/Storage Rules. View-only accounts have record mutation buttons hidden in the interface. Privileged school accounts can open **Portals → Parent Portal** in the sidebar for a layout preview; preview mode does not expose linked child records. Parents land on a dedicated Parent Home instead of the school-wide dashboard; it has no school-wide totals, provides a family overview with a child selector, and displays linked-record counts/fee balances only for collections the account may view. The Parent Portal uses section shortcuts in its header on desktop and a parent-specific fixed bottom navigation on mobile; shortcuts follow section and collection view permissions. Selecting one child filters linked-record subscriptions in the data API and the family overview; selecting all children restores the family-wide linked view. Parent linked data is loaded through the authenticated linked-record access path and restricted to linked student IDs. Parent defaults are Children, Attendance, Report Cards, Assignments, Fees, and school notices. Notices are school-wide announcements. Timetables and study materials are not enabled in parent defaults because those feeds are not yet filtered by the linked student’s class. An empty Parent section list falls back to the recommended views so the portal is not blank. Accounts with no assigned sections otherwise receive a clear access notice rather than a blank page. Teaching accounts must be assigned at least one existing class; personal student records are constrained to those classes.
- User Roles accepts administrator-set temporary passwords from 8 to 128 characters; letters or numbers alone are valid. Users must change them at first sign-in and can change their permanent password later from the key button in the portal header. School Admins can set new temporary passwords for active non-administrator accounts; the App Admin can reset any active school account, including administrator accounts. The user must change a reset password at next sign-in. Passwords are never written to Firestore or audit logs. Deliver temporary credentials privately; do not put them in chat channels, tickets, source control, or logs.
- School account creation, updates, activation/suspension, and deletion append metadata-only records to `schools/{schoolId}/auditEvents`. Records capture actor, subject, action, changed field names, and time; they do not store passwords, invitation links, or field values.
- Test Firestore/Storage rules and account callables with the Firebase Emulator before real school data is entered. Do not treat a successful Hosting deploy as proof that role or record-level rules are correct.

## Production safeguards in this repository

- `npm run check` syntax-checks application, Functions, test, and utility JavaScript.
- `npm test` runs Firestore, Functions, Storage, and Pub/Sub Emulator tests for tenant isolation, email/password administrator access, class-scoped student reads, immutable audit events, the actual audit trigger, and profile upload boundaries. Upload rules allow JPEG, PNG, and WebP only. The GitHub Actions workflow runs these checks for pushes and pull requests.
- Firestore record creates, updates, and deletes in supported school collections generate server-side metadata-only records at `schools/{schoolId}/auditEvents/{eventId}`. The Audit Logs screen reads these cloud events. The current trigger records actor UID, record ID, action, and changed field names; it does not capture client IP addresses, authentication failures, or read-only access.
- A Cloud Scheduler function starts a native Firestore export daily at 02:00 Africa/Kampala and records status in `platformBackupJobs`. A second scheduled function checks export operation status hourly. This is a platform-wide export, not a per-school backup; the Backups screen is still a local prototype and is not connected to these job records.

## Configure scheduled backups

1. Create a private Cloud Storage bucket in the same location as the Firestore database. Configure the bucket's retention and lifecycle policy to meet the school's approved retention schedule.
2. Grant the deployed Functions service account Firestore export permission (`roles/datastore.importExportAdmin`) and write access to the backup bucket (`roles/storage.objectAdmin`). Enable billing and the Firestore, Cloud Scheduler, and Cloud Functions services.
3. Copy `functions/.env.example` to `functions/.env.delivery-app-6a47f` and set `FIRESTORE_BACKUP_BUCKET` to the bucket name. Keep the project-specific environment file out of source control.
4. Deploy Functions, then verify `platformBackupJobs` reports a completed export and run a restore drill in a non-production Firebase project. A completed export without a tested restore is not a verified recovery plan.
5. Restore a native export with `gcloud firestore import gs://BUCKET_NAME/firestore-exports/EXPORT_ID` after selecting the intended project. Never test restore commands against the live school project.

## Remaining rollout work

- Modules whose browser keys are in `legacyDataCollections` are bridged, but not every menu item has an implemented record store or mapping. Add explicit serializers and tests for object-valued settings, forms not stored as arrays, file attachments, and remaining front-office/admissions/compliance records before calling the whole portal fully synchronized.
- Syncing SMS campaign records does not send messages. SMS/email delivery, payment reconciliation, absence alerts, fee reminders, and approval escalations remain disabled until message templates, recipient/consent rules, provider selection, and Secret Manager credentials are configured and tested.
- The conflict-review screen and role-specific linked-student/class feeds remain outstanding. Do not treat the all-module write bridge as proof that parent/student/teacher read paths are complete.
- The Firestore suite is a starting point, not complete coverage. Add tests for Storage rules, callable account functions, migration/import behavior, notification retries, and restore procedures before production data is entered.
- The Functions dependency tree still reports moderate UUID advisories from the current Firebase Admin major. The CI workflow gates high and critical production advisories; review and upgrade the Firebase Admin/Functions major as a separate tested change.
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