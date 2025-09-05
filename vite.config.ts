import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import type { ServerOptions as HttpsServerOptions } from 'https';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  // Check if mkcert-generated certificate files exist in the project root.
  const keyPath = path.resolve(__dirname, './localhost-key.pem');
  const certPath = path.resolve(__dirname, './localhost.pem');
  const useMkcert = fs.existsSync(keyPath) && fs.existsSync(certPath);

  // fix: Explicitly type `httpsconfig` with `HttpsServerOptions` to resolve type error.
  let httpsConfig: boolean | HttpsServerOptions;

  if (useMkcert) {
    // If files are found, use them for a trusted local HTTPS server (ideal for mobile).
    console.log('✅ Found mkcert certificates. Using them for a trusted HTTPS server.');
    httpsConfig = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      minVersion: 'TLSv1.2',
    };
  } else {
    // If not found, fall back to Vite's default self-signed certificate (good for desktop).
    console.log('⚠️ Could not find mkcert certificates. Using Vite\'s default certificate for HTTPS.');
    console.log('   For mobile testing, follow the one-time setup in README.md.');
    httpsConfig = true; 
  }

  return {
    plugins: [react()],
    server: {
      // Use the determined HTTPS configuration.
      https: httpsConfig,
      host: true,  // Expose to the network to allow access from mobile devices
    },
    define: {
      // Expose the API key to the app as process.env.API_KEY, as expected by the geminiService.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
