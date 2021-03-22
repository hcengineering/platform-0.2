module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: [
      '**/tsconfig.json',
    ]
  },
  plugins: ['@typescript-eslint', 'import', 'svelte3'],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'require-await': 'off',
    'no-return-await': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/prefer-readonly': ['error'],
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/type-annotation-spacing': ['error', { 'before': false, 'after': true, 'overrides': { 'arrow': { 'before': true, 'after': true }}}],
    '@typescript-eslint/no-unused-vars': ['error', { 'args': 'none' }],
    '@typescript-eslint/no-unused-expressions': 'error',
    'prefer-arrow-callback': [ 'error', { 'allowUnboundThis': false } ],
    '@typescript-eslint/no-misused-promises': [ 'error', { 'checksVoidReturn': false } ],
  },
  settings: {
    'svelte3/typescript': require('typescript'),
    // Ignore styles since SASS preprocessor is not supported in svelte plugin: https://github.com/sveltejs/eslint-plugin-svelte3/issues/10
    'svelte3/ignore-styles': () => true
  }
}
