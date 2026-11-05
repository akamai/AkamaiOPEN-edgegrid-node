import js from "@eslint/js";
import globals from "globals";

export default [
  // ESLint recommended base rules
  js.configs.recommended,

  {
    ignores: ["node_modules/"],
  },

  {
    files: ["src/**/*.js", "index.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      // Enforced rules
      "no-undef": "error",
      "no-unused-vars": "error",
      "no-caller": "error",
      "new-cap": "error",
      "wrap-iife": ["error", "any"],
      "no-cond-assign": "error",
      "no-debugger": "error",

      // Relaxed rules
      "curly": "off",
      "strict": "off",
      "no-eval": "off",
      "guard-for-in": "off",
      "no-empty": "off",
      "no-new": "off",
      "no-plusplus": "off",
      "dot-notation": "off",
      "no-console": "off",

      // Rules in ESLint's recommended set that JSHint had no equivalent for.
      // Disabled to keep parity with the previous lint behaviour.
      "no-prototype-builtins": "off",
      "preserve-caught-error": "off",
    },
  },
];