module.exports = {
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'import/extensions': ['error', 'ignorePackages', {
      js: 'always',
    }],
  },
};
