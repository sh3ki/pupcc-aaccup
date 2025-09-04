#!/bin/bash

# Cross-platform PDF.js worker file copy script for Linux/macOS
echo "📄 Copying PDF.js worker files (bash version)..."

# Create public/js directory if it doesn't exist
mkdir -p public/js

# Copy worker files
if [ -f "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs" ]; then
    cp "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs" "public/js/pdf.worker.mjs"
    echo "✓ Copied pdf.worker.mjs"
else
    echo "✗ pdf.worker.mjs not found"
    exit 1
fi

if [ -f "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs" ]; then
    cp "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs" "public/js/pdf.worker.min.js"
    echo "✓ Copied pdf.worker.min.mjs → pdf.worker.min.js"
else
    echo "✗ pdf.worker.min.mjs not found"
    exit 1
fi

# Optional: Copy .js version if it exists
if [ -f "node_modules/pdfjs-dist/legacy/build/pdf.worker.js" ]; then
    cp "node_modules/pdfjs-dist/legacy/build/pdf.worker.js" "public/js/pdf.worker.js"
    echo "✓ Copied pdf.worker.js"
else
    echo "ℹ pdf.worker.js not found (optional)"
fi

# Verify files exist
echo ""
echo "📊 Verification:"
for file in "pdf.worker.mjs" "pdf.worker.min.js" "pdf.worker.js"; do
    if [ -f "public/js/$file" ]; then
        size=$(du -h "public/js/$file" | cut -f1)
        echo "✓ $file - $size"
    else
        if [ "$file" != "pdf.worker.js" ]; then
            echo "✗ $file - missing"
        fi
    fi
done

echo ""
echo "🎉 PDF.js worker copy completed successfully!"
