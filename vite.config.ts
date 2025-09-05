import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // fix: The `https` configuration was causing a TypeScript error. Changing to an empty
      // object `{}` resolves the type incompatibility in the user's environment while
      // still signaling to Vite and its plugins to enable HTTPS.
      https: {}, // Enable HTTPS
      host: true,  // Expose to the network to allow access from mobile devices
    },
    define: {
      // Expose the API key to the app as process.env.API_KEY, as expected by the geminiService.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
