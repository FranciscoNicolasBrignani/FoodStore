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
        authRegistro: resolve(__dirname, 'src/pages/auth/registro/registro.html'),
        authLogin: resolve(__dirname, 'src/pages/auth/login/login.html'),
        cart: resolve(__dirname, 'src/cart/cart.html'),
      },
    },
  },
  base: './',
});