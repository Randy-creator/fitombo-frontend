import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { FITOMBO_API_PROXY_TARGET } = loadEnv(mode, process.cwd(), 'FITOMBO_')

  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '^/api(?:/|$)': {
          target: FITOMBO_API_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api(?=\/|$)/, '') || '/',
        },
      },
    },
  }
})
