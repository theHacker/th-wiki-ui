#!/usr/bin/env bash
# inspired by https://mionskowski.pl/posts/environment-agnostic-frontend-images/

set -o errexit

if [[ -z "${GRAPHQL_API_URL}" ]]; then
  echo "You must set GRAPHQL_API_URL."
  exit 1
fi
if [[ -z "${BASE_URL}" ]]; then
  echo "You must set BASE_URL."
  exit 1
fi

cat <<EOF > /usr/share/nginx/html/env.js
window.env = {
    GRAPHQL_API_URL: "${GRAPHQL_API_URL}",
    BASE_URL: "${BASE_URL}",
    DEVELOPMENT_STAGE: "${DEVELOPMENT_STAGE}"
};
EOF

echo Serving tH-Wiki UI with backend GraphQL API URL \"${GRAPHQL_API_URL}\" and base URL \"${BASE_URL}\".
