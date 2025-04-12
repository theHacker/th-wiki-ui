module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended'
    ],
    rules: {
        "no-constant-condition": ["error", {
            "checkLoops": false // TODO in ESLint v9, there is "allExceptWhileTrue"
        }],
        "no-unused-vars": ["error", {
            "argsIgnorePattern": "^_"
        }]
    },
    ignorePatterns: [
        "src/antlr/**" // generated code by ANTLR
    ],
    overrides: [
        {
            files: [
                'cypress/e2e/**/*.{cy,spec}.js',
                'cypress/support/**/*.js'
            ],
            'extends': [
                'plugin:cypress/recommended'
            ]
        }
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    }
};
