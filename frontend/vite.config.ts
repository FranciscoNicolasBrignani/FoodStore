import { defineConfig } from 'vite'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      input:{
        index: resolve(__dirname, 'index.html'),
        cart: resolve(__dirname, 'cart.html'),
      },
    },
  },
  base: './',
});