// empty settings
// - locally, import.meta.env (plus VITE_ prefix) are used (see .env.local)
// - in Docker container window.env is used (see 50-substitute-env-variables.sh)
window.env = {
    API_URL: "",
    BASE_URL: ""
};
