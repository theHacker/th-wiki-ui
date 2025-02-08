FROM nginx:1.27.0

COPY --chmod=755 docker/50-substitute-env-variables.sh /docker-entrypoint.d/
COPY docker/nginx-conf.d-default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html/
