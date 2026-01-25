import path from 'path';
import os from 'os';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const host = env.VITE_HOST || '0.0.0.0';
    const port = env.VITE_PORT ? Number(env.VITE_PORT) : 5173; // Default to Vite's default port

    // Prefer an explicit VITE_API_BASE_URL but fall back to the development machine hostname for local development
    const proxyTarget = (env.VITE_API_BASE_URL as string)?.replace(/\/api\/?$/, '') || 'http://DESKTOP-DIH7CQH:5235';
    return {
      server: {
        // Bind to all interfaces so the dev server is reachable on the LAN (DESKTOP-DIH7CQH.local)
        host: host,
        // Use a fixed port so mobile clients and other tooling can rely on a stable URL
        port: port,
        // Fail fast if the requested port is unavailable to avoid accidental port switching
        strictPort: true,
        // HMR configuration (ws) - ensures websocket compatibility for hot reloads
        hmr: {
          protocol: 'ws',
          // Expose the host used by clients (if you set VITE_HOST to 0.0.0.0, mobile devices will connect via the machine IP)
          host: process.env.VITE_HMR_HOST || env.VITE_HOST || undefined,
          // Client port can be set explicitly if needed (e.g. when using a reverse proxy)
          port: env.VITE_HMR_PORT ? Number(env.VITE_HMR_PORT) : undefined,
        },
        proxy: {
          // Proxy /api requests to the backend to avoid CORS and allow insecure/self-signed certs in dev
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
          // Proxy all other API-like requests (v1, analytics, health, moderation, support) to backend
          '/v1': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/analytics': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/health': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/moderation': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
          },
          '/support': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
          },
          // Proxy SignalR hubs (websocket upgrade) to the backend and enable ws support
          '/hubs': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            ws: true,
            rewrite: (path) => path.replace(/^\/hubs/, '/hubs'),
          },
          // Also proxy chathub directly
          '/chathub': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            ws: true,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@/components': path.resolve(__dirname, './src/components'),
          '@/features': path.resolve(__dirname, './src/features'),
          '@/services': path.resolve(__dirname, './src/services'),
          '@/api': path.resolve(__dirname, './src/api'),
          '@/context': path.resolve(__dirname, './src/context'),
          '@/hooks': path.resolve(__dirname, './src/hooks'),
          '@/types': path.resolve(__dirname, './src/types'),
          '@/utils': path.resolve(__dirname, './src/utils'),
          '@/assets': path.resolve(__dirname, './src/assets'),
          '@/mocks': path.resolve(__dirname, './src/mocks'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (!id) return undefined;
              // Split important vendor libs into their own chunks to keep sizes under control
              if (id.includes('node_modules/react-dom')) return 'vendor-react-dom';
              if (id.includes('node_modules/react')) return 'vendor-react';
              if (id.includes('node_modules/@google/genai')) return 'vendor-genai';
              if (id.includes('node_modules/recharts')) return 'vendor-recharts';
              if (id.includes('node_modules/react-toastify')) return 'vendor-toastify';
              if (id.includes('node_modules/zustand')) return 'vendor-zustand';

              // Feature-specific chunks
              if (id.includes('/src/features/support/') || id.includes('features/support')) return 'support';
              if (id.includes('/src/features/rbac/') || id.includes('features/rbac')) return 'rbac';
              if (id.includes('/src/components/layout/') || id.includes('components/layout')) return 'layout';

              // default for other node_modules
              if (id.includes('node_modules')) return 'vendor-others';
            }
          }
        }
      }
    };
});
