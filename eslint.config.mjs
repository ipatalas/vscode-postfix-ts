// @ts-check
import { defineConfig, globalIgnores } from "eslint/config";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    "**/out", "**/node_modules", "coverage", ".vscode-test", "test/index.ts",
    ".opencode/", "build.mjs", "eslint.config.mjs", "tasks.mjs"
  ]),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
      }],
      "prefer-const": ["error", {
        "destructuring": "all",
      }],
      "no-constant-condition": ["error", {
        "checkLoops": false,
      }],
      "curly": ["error"],
      "brace-style": "error",
      "indent": ["error", 2, {
        SwitchCase: 1,
      }],
      "@typescript-eslint/restrict-template-expressions": ["error", {
        "allowNumber": true,
        "allowBoolean": true,
        "allowNullish": true,
      }],
      "@typescript-eslint/no-unnecessary-type-parameters": ["warn"],
    },
  },
);
