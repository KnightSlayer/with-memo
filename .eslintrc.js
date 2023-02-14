module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "overrides": [],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "plugins": [
    "@typescript-eslint",
    "import",
  ],
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "comma-dangle":  ["error", "always-multiline"],
    "arrow-parens": ["error", "always"],
    "@typescript-eslint/no-empty-function": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/space-before-blocks": "warn",
    "@typescript-eslint/func-call-spacing": "warn",
    "@typescript-eslint/type-annotation-spacing": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-member-accessibility": ["error", {
      accessibility: "explicit",
      overrides: {
        constructors: "no-public",
      },
    }],
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    "@typescript-eslint/space-before-function-paren": ["error", {
      anonymous: "always",
      named: "never",
    }],
    "no-console": "warn",
    "no-debugger": "warn",
    "object-shorthand": ["error", "properties", { avoidQuotes: true }],
    "import/newline-after-import": ["error", { count: 1 }],
  },
};
