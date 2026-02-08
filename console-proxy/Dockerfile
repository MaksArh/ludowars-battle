FROM nginx:1.27-alpine

RUN apk add --no-cache openssl gettext

COPY nginx.auth.conf.template /etc/nginx/templates/nginx.auth.conf.template
COPY nginx.noauth.conf.template /etc/nginx/templates/nginx.noauth.conf.template
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
