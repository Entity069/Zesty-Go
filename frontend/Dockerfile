FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM nginx:alpine AS production
RUN addgroup -g 1001 -S zestygroup && adduser -S freakyuser -u 1001 -G zestygroup

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

RUN chown -R freakyuser:zestygroup /usr/share/nginx/html && \
    chown -R freakyuser:zestygroup /var/cache/nginx && \
    chown -R freakyuser:zestygroup /var/log/nginx && \
    chown -R freakyuser:zestygroup /etc/nginx && \
    mkdir -p /var/run/nginx && \
    chown -R freakyuser:zestygroup /var/run/nginx

USER freakyuser
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]