
tH-Wiki UI
===========

tH-Wiki will provide an easy solution to having my personal wiki, task and issue tracker – all in one.
YouTrack would fit closest (never tried their Knowledge Base feature, but back then the issue tracker was nice),
but I do not want proprietary software.

This is the frontend repository `th-wiki-ui`, see the backend repository `th-wiki` for additional
general documentation about tH-Wiki.


Setup
------

- Install [Bun](https://bun.sh/):
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
- Copy `.env.local.template` to `.env.local` and point it to the API.


Useful Links
-------------

- Configure Vite: https://vitejs.dev/config/
- Vue Test Utils (Wrappers): https://test-utils.vuejs.org/api/
- Cypress: https://docs.cypress.io/api/


Useful Commands
----------------

### Project Setup

```sh
bun i
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Compile and Minify for Production

```sh
bun run build
```

### Run Unit Tests with Bun

```sh
bun test
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
bun test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

> [!NOTE]
> End-to-end tests are not maintained at all, they don't work.

```sh
bun test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
bun run build
bun test:e2e
```

### Lint with [ESLint](https://eslint.org/)

Without changing the code:

```sh
bun lint
```

With `--fix`, which changes the code:

```sh
bun lint:fix
```

### ANTLR

Downloading ANTLR:

```sh
curl -O https://www.antlr.org/download/antlr-4.13.2-complete.jar
```

Invoking ANTLR:

```sh
alias antlr="java -jar antlr-4.13.2-complete.jar"
alias grun="java -cp .:antlr-4.13.2-complete.jar org.antlr.v4.gui.TestRig"

antlr
```

Generating sources:

```sh
antlr -Dlanguage=JavaScript -no-listener -visitor src/antlr/SearchQuery.g4 
```


How to Docker
--------------

### Run the UI

```shell
bun run build
docker build -t th-wiki-ui .
docker run --rm \
  -p 5173:80 \
  -e API_URL=http://localhost:8080/api \
  -e GRAPHQL_API_URL=http://localhost:8080/api/graphql \
  -e BASE_URL=/ \
  th-wiki-ui
```

### Execute the Tests like in CI

```shell
docker run --rm -it \
  -v .:/src \
  oven/bun:1.2.9-alpine /bin/sh -c "cd /src && bun test"
```
