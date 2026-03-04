import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default defineConfig([
  ...expoConfig,
  {
    ignores: ['out/**', 'dist/**', '.expo/**', 'web-build/**', 'web-archive/**'],
  },
]);
