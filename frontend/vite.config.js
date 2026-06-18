/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Injecte window.config comme un véritable objet runtime via un <script> dans index.html.
// Plus fiable que `define` : `define` fait une substitution textuelle au niveau de l'AST qui ne
// matche pas correctement les chaînes de type window.config.X servies en mode dev par Vite.
function windowConfigPlugin(values) {
    return {
        name: 'inject-window-config',
        transformIndexHtml() {
            return [
                {
                    tag: 'script',
                    injectTo: 'head-prepend',
                    children: `window.config = ${JSON.stringify(values)};`,
                },
            ];
        },
    };
}

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, '..');
    const env = loadEnv(mode, envDir, '');

    const frontendPort = Number(env.FRONTEND_PORT);

    return {
        root: path.resolve(__dirname, '.'),
        envDir,
        plugins: [
            windowConfigPlugin({
                ENV: env.ENV,
                GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
                FRONTEND_URL: env.FRONTEND_URL,
                BACKEND_URL: env.BACKEND_URL,
                MAIL_USER: env.MAIL_USER,
                WEBSITE_NAME: env.WEBSITE_NAME,
                PAYMENT_ENABLED: env.PAYMENT_ENABLED,
                GLITCHTIP_DSN_FRONTEND: env.GLITCHTIP_DSN_FRONTEND,
            }),
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
    };
});