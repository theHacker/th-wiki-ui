// empty settings
// - locally, import.meta.env (plus VITE_ prefix) are used (see .env.local)
// - in Docker container window.env is used (see 50-substitute-env-variables.sh)
// - in tests window.env must be defined with beforeAll
//   - "vitest" / "bun run test:unit" auto-sets up jsdom (see vitest.config.js)
//   - "bun test" uses bun-test-preload.js to setup window with jsdom
window.env = {
    API_URL: "",
    GRAPHQL_API_URL: "",
    BASE_URL: "",
    DEVELOPMENT_STAGE: ""
};
