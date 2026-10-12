const { after, before, test } = require('node:test');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require('@firebase/rules-unit-testing');
const { doc, setDoc } = require('firebase/firestore');
const { getMetadata, ref, uploadBytes } = require('firebase/storage');

let testEnvironment;

before(async () => {
    testEnvironment = await initializeTestEnvironment({
        projectId: 'demo-school-portal',
        firestore: {
            rules: await readFile(path.join(__dirname, '..', 'firestore.rules'), 'utf8')
        },
        storage: {
            rules: await readFile(path.join(__dirname, '..', 'storage.rules'), 'utf8')
        }
    });
    await testEnvironment.withSecurityRulesDisabled(async context => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'schools/SCH-TEST'), { status: 'active' });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/teacher-1'), {
            role: 'teacher',
            status: 'active'
        });
    });
});

after(async () => {
    await testEnvironment?.cleanup();
});

test('a school member can upload a raster profile image to their own folder', async () => {
    const storage = testEnvironment.authenticatedContext('teacher-1').storage();
    const imageRef = ref(storage, 'schools/SCH-TEST/members/teacher-1/profile/avatar.png');
    await assertSucceeds(uploadBytes(imageRef, new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
    await assertSucceeds(getMetadata(imageRef));
});

test('members cannot upload files into another account profile', async () => {
    const storage = testEnvironment.authenticatedContext('teacher-1').storage();
    const otherProfile = ref(storage, 'schools/SCH-TEST/members/other-user/profile/avatar.png');
    await assertFails(uploadBytes(otherProfile, new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
});

test('profile uploads reject SVG content', async () => {
    const storage = testEnvironment.authenticatedContext('teacher-1').storage();
    const svgRef = ref(storage, 'schools/SCH-TEST/members/teacher-1/profile/avatar.svg');
    await assertFails(uploadBytes(svgRef, new Uint8Array([1, 2, 3]), { contentType: 'image/svg+xml' }));
});
