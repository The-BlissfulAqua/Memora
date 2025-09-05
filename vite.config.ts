import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // Use a custom, locally-trusted certificate for better device compatibility.
      // The user must generate these files using `mkcert`. See README.md for instructions.
      https: {
        key: fs.readFileSync('./localhost-key.pem'),
        cert: fs.readFileSync('./localhost.pem'),
        // Enforce a modern, widely-supported TLS version to fix cipher negotiation errors.
        minVersion: 'TLSv1.2',
      },
      host: true,  // Expose to the network to allow access from mobile devices
    },
    define: {
      // Expose the API key to the app as process.env.API_KEY, as expected by the geminiService.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
