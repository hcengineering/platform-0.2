const typescriptRules = {
  '@typescript-eslint/no-empty-interface': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/return-await': 'error',
  '@typescript-eslint/type-annotation-spacing': ['error', {
    'before': false,
    'after': true,
    'overrides': {
      'arrow': {
        'before': true,
        'after': true
      }
    }
  }],
  '@typescript-eslint/no-unused-vars': ['error', { 'args': 'none' }],
  '@typescript-eslint/no-unused-expressions': 'error',
  '@typescript-eslint/no-misused-promises': ['error', { 'checksVoidReturn': false }]
};

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
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
      '**/tsconfig.json'
    ],
    extraFileExtensions: ['.svelte']
  },
  plugins: ['svelte3', '@typescript-eslint', 'import'],
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: typescriptRules
    },
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
      extends: ['plugin:@typescript-eslint/recommended'],
      // https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/OTHER_PLUGINS.md#eslint-plugin-import
      rules: {
        ...typescriptRules,
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off',
        'import/no-unresolved': 'off',
        'no-multiple-empty-lines': 'off',
        'no-undef-init': 'off'
      }
    }
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'require-await': 'off',
    'no-return-await': 'off',
    'prefer-arrow-callback': ['error', { 'allowUnboundThis': false }]
  },
  settings: {
    'svelte3/typescript': require('typescript'),
    // Ignore styles since SASS preprocessor is not supported in svelte plugin: https://github.com/sveltejs/eslint-plugin-svelte3/issues/10
    'svelte3/ignore-styles': () => true
  }
}
