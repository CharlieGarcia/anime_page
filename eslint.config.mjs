import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  // Enforce that all ts-nocheck comments have descriptions, to avoid accidentally leaving them in without explanation.
  // This is temporary until I finish migrating the codebase to TypeScript and can remove all ts-nocheck comments.
  {
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-nocheck': 'allow-with-description',
      }
    ]
  },
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    settings: {
      react: { version: '19' } // Avoids auto-detection crash
    }
  }
]);
