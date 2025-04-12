module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended'
    ],
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
