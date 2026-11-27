import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas relativas para que funcione en GitHub Pages (/GymSysters/)
  base: './',
  plugins: [tailwindcss()],
});
