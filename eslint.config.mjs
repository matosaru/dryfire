import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

// Typed components/adapters keep their existing rules. Native runtime cleanup
// also rejects unused declarations; rest-sibling omissions define saved schemas.
export default [{
  files: ['src/**/*.js', 'workers/**/*.js'],
  rules: { 'no-unused-vars': ['error', { ignoreRestSiblings: true }] },
}, {
  files: ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts', 'packages/**/*.tsx'],
  languageOptions: { parser: ts.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    globals: Object.fromEntries(['document','window','Element','Event','Document','afterEach','beforeEach','test','expect'].map(name => [name, 'readonly'])) },
  plugins: { '@typescript-eslint': ts.plugin, 'react-hooks': hooks },
  rules: { ...js.configs.recommended.rules, 'no-unused-vars': 'off', 'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error' },
}];
