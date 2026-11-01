const fs = require('node:fs');
const path = require('node:path');

const projectDirectory = path.resolve(__dirname, '..');
const sourceDirectory = path.join(projectDirectory, 'node_modules/@vladmandic/face-api/model');
const targetDirectory = path.join(projectDirectory, 'vendor/face-api-models');
const modelFiles = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model.bin',
    'face_landmark_68_tiny_model-weights_manifest.json',
    'face_landmark_68_tiny_model.bin',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model.bin'
];

fs.mkdirSync(targetDirectory, { recursive: true });

modelFiles.forEach(file => {
    fs.copyFileSync(path.join(sourceDirectory, file), path.join(targetDirectory, file));
});
