import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ["package.json", "package-lock.json", "node_modules/**"],
    },
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["app/public/**/*.js"],
        rules: {
            "no-unused-vars": "off",
        },
    },
    {
        files: ["tests/**/*.js", "tests/**/*.cjs"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
    },
];
