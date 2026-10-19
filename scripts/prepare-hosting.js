const fs = require('node:fs');
const path = require('node:path');

const projectDirectory = path.resolve(__dirname, '..');
const publicDirectory = path.join(projectDirectory, 'public');
const excludedEntries = new Set([
    '.firebase',
    '.git',
    'functions',
    'node_modules',
    'public',
    'scripts'
]);
const excludedFiles = new Set([
    '.firebaserc',
    'firebase.json',
    'firestore-debug.log',
    'firestore.indexes.json',
    'firestore.rules',
    'package-lock.json',
    'package.json',
    'storage.rules'
]);

function shouldCopy(sourcePath) {
    const relativePath = path.relative(projectDirectory, sourcePath);
    const segments = relativePath.split(path.sep);
    const name = segments.at(-1);
    return !segments.some(segment => segment.startsWith('.') || excludedEntries.has(segment))
        && !excludedFiles.has(name)
        && !name.endsWith('.md')
        && !name.endsWith('.log');
}

fs.rmSync(publicDirectory, { recursive: true, force: true });
fs.mkdirSync(publicDirectory, { recursive: true });

for (const entry of fs.readdirSync(projectDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(projectDirectory, entry.name);
    if (!shouldCopy(sourcePath)) continue;
    fs.cpSync(sourcePath, path.join(publicDirectory, entry.name), {
        recursive: entry.isDirectory(),
        filter: shouldCopy
    });
}

if (!fs.existsSync(path.join(publicDirectory, 'index.html'))) {
    throw new Error('Hosting staging did not produce public/index.html.');
}

[
    ['node_modules/qrcode-generator/dist/qrcode.js', 'vendor/qrcode.js'],
    ['node_modules/jsqr/dist/jsQR.js', 'vendor/jsQR.js'],
    ['node_modules/@vladmandic/face-api/dist/face-api.js', 'vendor/face-api.js'],
    ['node_modules/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json', 'vendor/face-api-models/tiny_face_detector_model-weights_manifest.json'],
    ['node_modules/@vladmandic/face-api/model/tiny_face_detector_model.bin', 'vendor/face-api-models/tiny_face_detector_model.bin'],
    ['node_modules/@vladmandic/face-api/model/face_landmark_68_tiny_model-weights_manifest.json', 'vendor/face-api-models/face_landmark_68_tiny_model-weights_manifest.json'],
    ['node_modules/@vladmandic/face-api/model/face_landmark_68_tiny_model.bin', 'vendor/face-api-models/face_landmark_68_tiny_model.bin'],
    ['node_modules/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json', 'vendor/face-api-models/face_recognition_model-weights_manifest.json'],
    ['node_modules/@vladmandic/face-api/model/face_recognition_model.bin', 'vendor/face-api-models/face_recognition_model.bin']
].forEach(([sourceRelativePath, targetRelativePath]) => {
    const sourcePath = path.join(projectDirectory, sourceRelativePath);
    const targetPath = path.join(publicDirectory, targetRelativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
});

const hostedIndexPath = path.join(publicDirectory, 'index.html');
const hostedIndex = fs.readFileSync(hostedIndexPath, 'utf8')
    .replace('./node_modules/qrcode-generator/dist/qrcode.js', './vendor/qrcode.js')
    .replace('./node_modules/jsqr/dist/jsQR.js', './vendor/jsQR.js')
    .replace('./node_modules/@vladmandic/face-api/dist/face-api.js', './vendor/face-api.js');
fs.writeFileSync(hostedIndexPath, hostedIndex);

const hostedIdCardsPath = path.join(publicDirectory, 'id-cards.js');
const hostedIdCards = fs.readFileSync(hostedIdCardsPath, 'utf8')
    .replace('./node_modules/@vladmandic/face-api/model', './vendor/face-api-models');
fs.writeFileSync(hostedIdCardsPath, hostedIdCards);

console.log('Prepared Firebase Hosting files in public/.');
