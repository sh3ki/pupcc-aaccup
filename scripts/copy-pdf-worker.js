#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform PDF.js worker file copy script
console.log('📄 Copying PDF.js worker files...');

// Ensure public/js directory exists
const publicJsDir = path.join(__dirname, '..', 'public', 'js');
if (!fs.existsSync(publicJsDir)) {
    fs.mkdirSync(publicJsDir, { recursive: true });
    console.log('✓ Created public/js directory');
}

// Source paths
const nodePath = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build');
const sources = [
    { src: 'pdf.worker.mjs', dest: 'pdf.worker.mjs' },
    { src: 'pdf.worker.min.mjs', dest: 'pdf.worker.min.js' }, // Rename .min.mjs to .min.js
    { src: 'pdf.worker.js', dest: 'pdf.worker.js', optional: true }
];

let copiedFiles = 0;
let errors = 0;

sources.forEach(({ src, dest, optional = false }) => {
    const srcPath = path.join(nodePath, src);
    const destPath = path.join(publicJsDir, dest);
    
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✓ Copied ${src} → ${dest}`);
            copiedFiles++;
        } else if (!optional) {
            console.warn(`⚠ Warning: ${src} not found`);
            errors++;
        } else {
            console.log(`ℹ Optional file ${src} not found (skipping)`);
        }
    } catch (error) {
        console.error(`✗ Error copying ${src}:`, error.message);
        errors++;
    }
});

// Verify files exist and get sizes
console.log('\n📊 Verification:');
sources.forEach(({ dest }) => {
    const destPath = path.join(publicJsDir, dest);
    if (fs.existsSync(destPath)) {
        const stats = fs.statSync(destPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✓ ${dest} - ${sizeMB} MB`);
    }
});

console.log(`\n🎉 PDF.js worker copy completed: ${copiedFiles} files copied, ${errors} errors`);

if (errors > 0) {
    globalThis.process.exit(1);
}
