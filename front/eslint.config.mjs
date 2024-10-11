import globals from "globals";
import pluginJs from "@eslint/js";
// import tseslint from "@typescript-eslint/eslint-plugin";
import tseslint from 'typescript-eslint';
import tsParser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: globals.browser,
      parser: tsParser, // Using TypeScript parser for both JS and TS
    },
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
      react: pluginReact,
    },
    rules: {
      "prettier/prettier": "error", // Prettier-related rules as errors
      "no-unused-vars": "off", // Turn off default no-unused-vars
      "unused-imports/no-unused-imports": "error", // Automatically remove unused imports
      "@typescript-eslint/no-unused-vars": "error", 
    },
  },
  pluginJs.configs.recommended, // ESLint recommended JS rules
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended, // React recommended rules (Flat config)
];
