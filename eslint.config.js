import {includeIgnoreFile} from "@eslint/compat";
import {fileURLToPath} from "node:url";
import globals from "globals";
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import cypress from "eslint-plugin-cypress";

// Ignore all files in .gitignore. (ESLint 9+)
// See https://eslint.org/docs/latest/use/configure/ignore#including-gitignore-files
const gitignoreAbsolutePath = fileURLToPath(new URL(".gitignore", import.meta.url));
const gitignoreConfig = includeIgnoreFile(gitignoreAbsolutePath);

export default [
    gitignoreConfig,
    {
        ignores: [
            "src/antlr/**" // generated code by ANTLR
        ]
    },
    ...vue.configs["flat/essential"],
    {
        files: [
            "**/*.js",
            "**/*.vue"
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-unused-vars": ["error", {
                "argsIgnorePattern": "^_"
            }]
        }
    },
    {
        files: [
            "cypress/e2e/**/*.{cy,spec}.js",
            "cypress/support/**/*.js"
        ],
        plugins: {
            cypress
        },
        ...cypress.configs.recommended
    }
];
