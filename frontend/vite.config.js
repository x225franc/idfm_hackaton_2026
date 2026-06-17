/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, '..');
    const env = loadEnv(mode, envDir, '');

    const frontendPort = Number(env.FRONTEND_PORT);

    return {
        root: path.resolve(__dirname, '.'),
        envDir,
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                devOptions: { enabled: true },
                manifest: {
                    name: env.WEBSITE_NAME || 'IDFM Hackaton 2026',
                    short_name: 'IDFM',
                    description: 'Application pour le hackaton IDFM',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    display: 'standalone',
                    icons: [
                        { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
                        { src: '/logo512.png', sizes: '512x512', type: 'image/png' }
                    ]
                }
            })
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        build: {
            outDir: 'dist',
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/setupTests.js'],
        },
        server: {
            port: frontendPort,
            host: true,
            watch: {
                usePolling: true,
            }
        },
        define: {
            'window.config': {}, 
            'window.config.ENV': JSON.stringify(env.ENV),
            'window.config.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID),
            'window.config.FRONTEND_URL': JSON.stringify(env.FRONTEND_URL),
            'window.config.BACKEND_URL': JSON.stringify(env.BACKEND_URL),
            'window.config.MAIL_USER': JSON.stringify(env.MAIL_USER),
            'window.config.WEBSITE_NAME': JSON.stringify(env.WEBSITE_NAME),
            'window.config.PAYMENT_ENABLED': JSON.stringify(env.PAYMENT_ENABLED),
        },
    };
});