// eslint.config.js
export default [
  {
    ignores: ['dist', 'node_modules', 'scripts']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^(React|App|Timeline|Navigation|Section|LanguageSwitcher)$',
        argsIgnorePattern: '^_'
      }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    }
  }
];
