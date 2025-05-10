import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/starwars-timeline/', // Replace with your repository name
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
});
