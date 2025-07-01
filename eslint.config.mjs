// eslint.config.js — single flat-config, no nested arrays
import tseslint        from 'typescript-eslint';
import reactPlugin     from 'eslint-plugin-react';
import importPlugin    from 'eslint-plugin-import';
import unusedPlugin    from 'eslint-plugin-unused-imports';

export default [

    /** ----------------------------------------------------------
   *  Global ignore rules – applied before any other configs
   * ---------------------------------------------------------- */
  {
    // no `files` key  →  this object applies to all files
    ignores: [
      '**/dist/**',      // any dist folder at any depth
      '**/build/**',     // JS/TS build outputs
      'strapi/**',       // the whole Strapi project
    ],
  },

  /* ------------------------------------------------------------------
   * 1)  Core TS / JS rules (applies to everything)
   * ------------------------------------------------------------------ */
  ...tseslint.config(
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '*/build/*',
        '.next/**',
        '.cache/**',
        'strapi/**'
      ],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: ['./backend/tsconfig.json', './frontend/tsconfig.json'],
          sourceType: 'module',
          ecmaVersion: 'latest',
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        react: reactPlugin,
      },
      settings: { react: { version: 'detect' } },
    },
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
  ),

  /* ------------------------------------------------------------------
   * 2)  React / Next / Strapi overrides
   * ------------------------------------------------------------------ */
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js auto-imports React
      'react/prop-types': 'off',         // rely on TS types
    },
  },

  /* ------------------------------------------------------------------
   * 3)  Import order + unused-code cleanup
   * ------------------------------------------------------------------ */
  {
    plugins: {
      import: importPlugin,
      unusedImports: unusedPlugin,
    },
    rules: {
      // deterministic grouping of imports
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],

      // strip dead code
      'unusedImports/no-unused-imports': 'error',
      'unusedImports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
