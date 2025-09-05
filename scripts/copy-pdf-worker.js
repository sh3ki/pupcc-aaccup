#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform PDF.js worker file copy script with production optimizations
console.log('📄 Copying and optimizing PDF.js worker files...');

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
    { src: 'pdf.worker.min.mjs', dest: 'pdf.worker.min.js' }, // Rename .min.mjs to .min.js for better compatibility
    { src: 'pdf.worker.js', dest: 'pdf.worker.js', optional: true },
    // Also copy regular PDF.js for fallback
    { src: 'pdf.mjs', dest: 'pdf.min.js', optional: true },
    { src: 'pdf.js', dest: 'pdf.fallback.js', optional: true }
];

// Function to add integrity hash
const addIntegrityHash = (filePath) => {
    try {
        const content = fs.readFileSync(filePath);
        const hash = createHash('sha384').update(content).digest('base64');
        return `sha384-${hash}`;
    } catch (error) {
        console.warn(`⚠ Could not generate integrity hash for ${filePath}`);
        return null;
    }
};

let copiedFiles = 0;
let errors = 0;
const integrityHashes = {};

sources.forEach(({ src, dest, optional = false }) => {
    const srcPath = path.join(nodePath, src);
    const destPath = path.join(publicJsDir, dest);
    
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            
            // Generate integrity hash for security
            const integrity = addIntegrityHash(destPath);
            if (integrity) {
                integrityHashes[dest] = integrity;
            }
            
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

// Create a manifest file for integrity checking
const manifestPath = path.join(publicJsDir, 'pdf-workers-manifest.json');
const manifest = {
    generated: new Date().toISOString(),
    files: integrityHashes,
    version: 'pdfjs-5.4.54'
};

try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ Created worker manifest file');
} catch (error) {
    console.warn('⚠ Could not create manifest file:', error.message);
}

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
console.log('💡 Production optimization: Use OptimizedPdfViewer for faster loading');

if (errors > 0) {
    globalThis.process.exit(1);
}
