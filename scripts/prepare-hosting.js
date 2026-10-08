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

console.log('Prepared Firebase Hosting files in public/.');
