/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [
      2,
      { args: 'all', argsIgnorePattern: '^_' },
    ],
    'no-unused-labels': 'error',
    'no-unused-expressions': 'error',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        printWidth: 80,
      },
    ],
  },
};