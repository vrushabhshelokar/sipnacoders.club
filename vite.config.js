import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      {
        name: 'api-visitors-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || '';
            if (url === '/api/visitors' || url.startsWith('/api/visitors?')) {
              try {
                const { default: handler } = await import('./api/visitors.js');
                const [pathname, search] = url.split('?');
                req.query = Object.fromEntries(new URLSearchParams(search || ''));
                return handler(req, res);
              } catch (err) {
                console.error('Local dev API error:', err);
                next();
              }
            } else if (url === '/api/settings' || url.startsWith('/api/settings?')) {
              try {
                const { default: handler } = await import('./api/settings.js');
                req.query = {};
                return handler(req, res);
              } catch (err) {
                console.error('Local dev Settings API error:', err);
                next();
              }
            } else if (url === '/api/admin/analytics' || url.startsWith('/api/admin/analytics?')) {
              try {
                const { default: handler } = await import('./api/admin/analytics.js');
                const [pathname, search] = url.split('?');
                req.query = Object.fromEntries(new URLSearchParams(search || ''));
                return handler(req, res);
              } catch (err) {
                console.error('Local dev Admin API error:', err);
                next();
              }
            } else if (url === '/api/people' || url.startsWith('/api/people?')) {
              try {
                const { default: handler } = await import('./api/people.js');
                const [pathname, search] = url.split('?');
                req.query = Object.fromEntries(new URLSearchParams(search || ''));
                return handler(req, res);
              } catch (err) {
                console.error('Local dev People API error:', err);
                next();
              }
            } else if (url === '/api/admin/people' || url.startsWith('/api/admin/people?')) {
              try {
                const { default: handler } = await import('./api/admin/people.js');
                const [pathname, search] = url.split('?');
                req.query = Object.fromEntries(new URLSearchParams(search || ''));
                return handler(req, res);
              } catch (err) {
                console.error('Local dev Admin People API error:', err);
                next();
              }
            } else {
              next();
            }
          });
        },
      },
    ],

    base: '/',

    server: {
      host: true,
      allowedHosts: [
        '.trycloudflare.com',
        'sipnacoders.club',
      ],
    },

    // ✅ Vite will now recognize .lottie files as assets
    assetsInclude: ['**/*.lottie'],
  };
})
