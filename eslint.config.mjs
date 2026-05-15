import nx from "@nx/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    ignores: ["**/dist", "**/out-tsc"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts", "**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
    // Override or add rules here
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
          semi: true,
        },
      ],
    },
  },
  ...nx.configs["flat/angular"],
  ...nx.configs["flat/angular-template"],
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.ts"],
    rules: {
      "prettier/prettier": "off",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: await import("@angular-eslint/template-parser"),
    },
    // Override or add rules here
    rules: {
      "prettier/prettier": ["error", { parser: "angular" }],
    },
  },
];
