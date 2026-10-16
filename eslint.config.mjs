import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

// Incremental scope: new typed components/adapters. Existing tested JavaScript
// keeps its current contract until its own migration step.
export default [{
  files: ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts', 'packages/**/*.tsx'],
  languageOptions: { parser: ts.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    globals: Object.fromEntries(['document','window','Element','Event','Document','afterEach','beforeEach','test','expect'].map(name => [name, 'readonly'])) },
  plugins: { '@typescript-eslint': ts.plugin, 'react-hooks': hooks },
  rules: { ...js.configs.recommended.rules, 'no-unused-vars': 'off', 'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error' },
}];
