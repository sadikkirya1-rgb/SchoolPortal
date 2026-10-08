const { applicationDefault, initializeApp } = require('../functions/node_modules/firebase-admin/app');
const { getAuth } = require('../functions/node_modules/firebase-admin/auth');

const projectId = 'delivery-app-6a47f';
const uid = process.argv[2];

if (!uid) {
    console.error('Usage: node scripts/grant-app-admin.js FIREBASE_AUTH_UID');
    process.exitCode = 1;
} else {
    const app = initializeApp({
        credential: applicationDefault(),
        projectId
    });

    getAuth(app).getUser(uid)
        .then(user => getAuth(app).setCustomUserClaims(uid, {
            ...user.customClaims,
            appAdmin: true
        }))
        .then(() => console.log(`Granted appAdmin claim to Firebase Auth user ${uid} in ${projectId}.`))
        .catch(error => {
            console.error('Unable to grant the App Admin claim.', error);
            process.exitCode = 1;
        });
}
