import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Hoặc plugin tương ứng của bạn
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    cloudflare()
  ],
  build: {
    outDir: 'dist',
  },
});
