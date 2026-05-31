import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
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
  // assetsInclude: ['**/*.lottie'],
})
