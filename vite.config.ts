import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        drop: ['console', 'debugger'], // Remove console logs in production
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    optimizeDeps: {
        include: ['pdfjs-dist', 'react', 'react-dom', '@inertiajs/react'],
        exclude: ['@vite/client', '@vite/env'],
    },
    build: {
        target: 'es2020',
        minify: 'esbuild',
        cssMinify: true,
        reportCompressedSize: false, // Faster builds
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React bundle
                    'react-vendor': ['react', 'react-dom'],
                    // Inertia bundle
                    'inertia': ['@inertiajs/react'],
                    // PDF functionality
                    'pdfjs-dist': ['pdfjs-dist'],
                    // UI components
                    'ui-vendor': [
                        '@headlessui/react', 
                        '@heroicons/react',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-dialog',
                        'lucide-react'
                    ]
                },
                // Better caching with content-based filenames
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
                    const info = assetInfo.name.split('.');
                    const extType = info[info.length - 1];
                    if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                        return `images/[name]-[hash].${extType}`;
                    }
                    if (/\.(css)$/i.test(assetInfo.name)) {
                        return `css/[name]-[hash].${extType}`;
                    }
                    return `assets/[name]-[hash].${extType}`;
                }
            },
            // Optimize imports
            external: [],
        },
        // Better compression
        assetsInlineLimit: 4096, // Inline small assets
    },
    server: {
        host: true, 
        port: 5173,
        cors: true,
        hmr: {
            host: 'localhost', 
        }
    }
});
