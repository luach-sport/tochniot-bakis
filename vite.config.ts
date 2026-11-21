import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import siteConfig from './site.config.json';

// basePath מגיע מקובץ site.config.json.
// כשעוברים לכתובת משלכם (למשל tochniot.co.il) משנים שם ל- "/".
export default defineConfig({
  base: siteConfig.basePath,
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  ssr: {
    noExternal: ['lucide-react'],
  },
});
