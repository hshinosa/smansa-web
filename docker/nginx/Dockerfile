FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/sites/ /etc/nginx/sites-available/
COPY public/ /var/www/public/
COPY --from=node-builder /app/public/build /var/www/public/build

EXPOSE 80 443
