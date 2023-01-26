// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": ["error", { "destructuring": "all" }],
    "no-constant-condition": ["error", { "checkLoops": false }],
    "curly": ["error"],
    "brace-style": "error",
    "indent": ["error", 2, {
      SwitchCase: 1
    }]
  }
}
